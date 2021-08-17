/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler, SingleHostDiscovery } from '@backstage/backend-common';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { IdentityClient } from '@backstage/plugin-auth-backend';
import { Config } from '@backstage/config';
import {
  AuthorizeRequest,
  AuthorizeResponse,
} from '@backstage/plugin-permission';
import { PermissionHandler } from '../types';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  permissionHandler: PermissionHandler;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, permissionHandler } = options;
  const discovery = SingleHostDiscovery.fromConfig(config);
  const identity = new IdentityClient({
    discovery,
    issuer: await discovery.getExternalBaseUrl('auth'),
  });

  const router = Router();
  router.use(express.json());

  router.post(
    '/authorize',
    async (
      req: Request<AuthorizeRequest[]>,
      res: Response<AuthorizeResponse[]>,
    ) => {
      // TODO(mtlewis/orkohunter): Payload too large errors happen when internal backends (techdocs, search, etc.) try
      // to fetch all of entities.
      // Fix1: The request should only contain entity refs instead of full entity.
      // Fix2: We should probably not filter requests from other backends -
      // either by allowing them a superuser token or treating their requests separately from a user's request.
      const token = IdentityClient.getBearerToken(req.header('authorization'));

      if (token) {
        const user = await identity.authenticate(token);
        logger.info(`authorizing as user: ${user.id}...`);

        res.json(
          await Promise.all(
            req.body.map((authorizeRequest: AuthorizeRequest) =>
              permissionHandler.handle(authorizeRequest, user),
            ),
          ),
        );
      } else {
        logger.info('authorizing anonymously...');

        res.json(
          await Promise.all(
            req.body.map((authorizeRequest: AuthorizeRequest) =>
              permissionHandler.handle(authorizeRequest),
            ),
          ),
        );
      }
    },
  );

  router.use(errorHandler());
  return router;
}
