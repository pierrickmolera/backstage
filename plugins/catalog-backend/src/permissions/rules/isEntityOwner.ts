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
import {
  Entity,
  EntityRelation,
  RELATION_OWNED_BY,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  FilterResolver,
  PermissionCondition,
  PermissionRule,
} from '@backstage/permission-common';
import { EntitiesSearchFilter } from '../../catalog/types';

export const isEntityOwnerRule: PermissionRule = {
  name: 'IS_ENTITY_OWNER',
  description: 'Allow entities owned by the current user',
};

export function isEntityOwner(claims: string[]): PermissionCondition {
  return {
    rule: isEntityOwnerRule.name,
    params: claims,
  };
}

export const isEntityOwnerMatcher: FilterResolver<
  Entity,
  EntitiesSearchFilter,
  [string[]]
> = {
  name: 'IS_ENTITY_OWNER',
  apply: (resource: Entity, claims: string[]): boolean => {
    if (!resource.relations) {
      return false;
    }

    return resource.relations
      .filter((relation: EntityRelation) => relation.type === RELATION_OWNED_BY)
      .some(relation => claims.includes(stringifyEntityRef(relation.target)));
  },

  serialize: (claims: string[]) => ({
    key: 'spec.owner',
    matchValueIn: claims,
  }),
};
