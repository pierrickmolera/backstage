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
import { BackstageIdentity } from '@backstage/plugin-auth-backend';
import { FilterResolver } from '@backstage/permission-common';
import {
  Entity,
  EntityName,
  EntityRelation,
  parseEntityRef,
  RELATION_OWNED_BY,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { EntitiesSearchFilter } from '../../catalog/types';

// TODO(authorization-framework) eventually all the claims
// should be pulled off the token and used to evaluate
// transitive ownership (I own anything owned by my user
// or any of the groups I'm in).
export const isEntityOwner: FilterResolver<Entity, EntitiesSearchFilter> = {
  name: 'IS_ENTITY_OWNER',
  description: 'Allow entities owned by the current user',
  params: [],
  apply: (
    identity: BackstageIdentity | undefined,
    resource: Entity,
  ): boolean => {
    if (!resource.relations) {
      return false;
    }

    if (!identity) {
      return false;
    }

    return resource.relations
      .filter((relation: EntityRelation) => relation.type === RELATION_OWNED_BY)
      .some(
        relation =>
          stringifyEntityRef(relation.target) ===
          stringifyEntityRef(
            parseEntityRef(identity?.id ?? '', {
              defaultKind: 'user',
              defaultNamespace: 'default',
            }) as EntityName,
          ),
      );
  },

  serialize: (identity: BackstageIdentity | undefined) => ({
    key: 'spec.owner',
    matchValueIn: [
      stringifyEntityRef({
        kind: 'user',
        namespace: 'default',
        // TODO(authorization-framework): we need a way to handle the
        // case where there's no identity (in this case all entities
        // should be filtered out)
        name: identity?.id || '',
      }),
    ],
  }),
};
