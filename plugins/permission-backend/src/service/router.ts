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
  IdentifiedAuthorizeRequestJSON,
  AuthorizeResult,
  IdentifiedAuthorizeResponse,
  Permission,
} from '@backstage/permission-common';
import { PermissionHandler } from '../handler';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  permissionHandlers: PermissionHandler[];
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, permissionHandlers } = options;
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
      req: Request<IdentifiedAuthorizeRequestJSON[]>,
      res: Response<IdentifiedAuthorizeResponse[]>,
    ) => {
      // TODO(mtlewis/orkohunter): Payload too large errors happen when internal backends (techdocs, search, etc.) try
      // to fetch all of entities.
      // Fix1: The request should only contain entity refs instead of full entity.
      // Fix2: We should probably not filter requests from other backends -
      // either by allowing them a superuser token or treating their requests separately from a user's request.
      const token = IdentityClient.getBearerToken(req.header('authorization'));
      const user = token ? await identity.authenticate(token) : undefined;

      const body: IdentifiedAuthorizeRequestJSON[] = req.body;
      const authorizeRequests = body.map(request => {
        const { id, permission, context } = request;
        return {
          id,
          permission: Permission.fromJSON(permission),
          context,
        };
      });

      // TODO(timbonicus/joeporpeglia): wire up frontend to supply id, accept array of permission requests
      const handled: Record<string, IdentifiedAuthorizeResponse | undefined> =
        {};
      for (const handler of permissionHandlers) {
        const unhandled = authorizeRequests.filter(
          authorizeRequest => !handled[authorizeRequest.id],
        );
        const response = await handler.handle(unhandled, user);
        response.forEach(r => {
          if (r.result !== AuthorizeResult.DEFER) {
            handled[r.id] = r;
          }
        });
      }

      const response = authorizeRequests.map(authorizeRequest => ({
        id: authorizeRequest.id,
        // Default to DENY for any requests not handled by any PermissionHandler
        result: handled[authorizeRequest.id]?.result ?? AuthorizeResult.DENY,
      }));

      res.json(response);
    },
  );

  router.use(errorHandler());
  return router;
}
