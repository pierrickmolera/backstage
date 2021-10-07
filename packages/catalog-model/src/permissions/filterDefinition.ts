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
import type { PluginEndpointDiscovery } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { EntitiesSearchFilter } from '@backstage/plugin-catalog-backend';
import { ResourceFilterDefinition } from '@backstage/permission-common';
import { Entity } from '../entity';
import { parseEntityRef } from '../entity/ref';
import { RESOURCE_TYPE_CATALOG_ENTITY } from '.';

export class CatalogEntityFilterDefinition extends ResourceFilterDefinition<
  Entity,
  EntitiesSearchFilter
> {
  getResourceType() {
    return RESOURCE_TYPE_CATALOG_ENTITY;
  }

  getResource(
    resourceRef: string,
    {
      discoveryApi,
    }: {
      discoveryApi: PluginEndpointDiscovery;
    },
  ) {
    const catalog = new CatalogClient({ discoveryApi });

    return catalog.getEntityByName(parseEntityRef(resourceRef));
  }
}
