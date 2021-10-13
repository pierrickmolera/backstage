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

import { ResourceFilterResolverConfig } from '@backstage/plugin-permission-backend';
import {
  Entity,
  parseEntityRef,
  RESOURCE_TYPE_CATALOG_ENTITY,
} from '@backstage/catalog-model';
import { hasAnnotationRule } from './hasAnnotation';
import { isEntityKindRule } from './isEntityKind';
import { isEntityOwnerRule } from './isEntityOwner';
import { EntitiesCatalog } from '../../catalog/types';
import { basicEntityFilter } from '../../service/request';
import {
  PermissionCondition,
  PermissionRules,
} from '@backstage/permission-common';
import { Filters } from '@backstage/backend-common';

export const catalogPermissionRules = new PermissionRules({
  // TODO(authorization-framework): fix type of condition params. might need to rely on unknown/any at the framework level
  rules: [isEntityOwnerRule, isEntityKindRule, hasAnnotationRule],
});

export class CatalogEntityFilterResolverConfig
  implements ResourceFilterResolverConfig<Entity>
{
  constructor(private readonly entitiesCatalog: EntitiesCatalog) {}

  getResourceType() {
    return RESOURCE_TYPE_CATALOG_ENTITY;
  }

  apply(resource: Entity, filters: Filters<PermissionCondition<any>>) {
    return catalogPermissionRules.apply(resource, filters);
  }

  async getResource(resourceRef: string) {
    const parsed = parseEntityRef(resourceRef);

    const { entities } = await this.entitiesCatalog.entities(
      {
        filter: basicEntityFilter({
          kind: parsed.kind,
          'metadata.namespace': parsed.namespace,
          'metadata.name': parsed.name,
        }),
      },
      false,
    );

    if (!entities.length) {
      return undefined;
    }

    return entities[0];
  }
}
