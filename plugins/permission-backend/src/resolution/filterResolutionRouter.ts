/*
 * Copyright 2021 The Backstage Authors
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

import Router from 'express-promise-router';
import express from 'express';
import { Filters } from '@backstage/backend-common';
import { ResourceFilterResolverConfig } from './ResourceFilterResolverConfig';
import { PermissionCondition } from '@backstage/permission-common';

type RouterOptions<TResource> = {
  filterResolverConfig: ResourceFilterResolverConfig<TResource>;
};

type ApplyRequestBody = {
  resourceRef: string;
  resourceType: string;
  filters: Filters<PermissionCondition<unknown>>;
};

export const filterResolutionRouter = async <TResource>({
  filterResolverConfig,
}: RouterOptions<TResource>): Promise<express.Router> => {
  const router = Router();

  router.use('/permissions/', express.json());

  router.post('/permissions/resolve-filters', async (req, res) => {
    const body = req.body as ApplyRequestBody;

    // TODO(authorization-framework): validate input, inc. that resource type
    // matches expected value.

    const resource = await filterResolverConfig.getResource(body.resourceRef);

    if (!resource) {
      return res.status(400).end();
    }

    const allowed = filterResolverConfig.apply(resource, body.filters);

    return res.status(200).json({ allowed });
  });

  return router;
};
