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

import { createPermissionIntegration } from '@backstage/plugin-permission-backend';
import { Entity, parseEntityRef } from '@backstage/catalog-model';
import { EntitiesCatalog } from '../catalog/types';
import { basicEntityFilter } from '../service/request';
import { hasAnnotation, isEntityKind, isEntityOwner } from './rules';

const getEntity = async (
  resourceRef: string,
  entitiesCatalog: EntitiesCatalog,
): Promise<Entity | undefined> => {
  const parsed = parseEntityRef(resourceRef);

  const { entities } = await entitiesCatalog.entities(
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
};

// TODO(authorization-framework): explore the possibility
// of allowing consumers of the catalog-backend to supply
// additional filters.
export const {
  createPermissionIntegrationRouter,
  conditions,
  createConditions,
  toQuery,
  registerPermissionRule,
} = createPermissionIntegration({
  pluginId: 'catalog',
  resourceType: 'catalog-entity',
  rules: { hasAnnotation, isEntityKind, isEntityOwner },
  getResource: getEntity,
});