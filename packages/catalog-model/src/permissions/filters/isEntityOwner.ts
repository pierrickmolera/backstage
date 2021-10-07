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
import { EntitiesSearchFilter } from '@backstage/plugin-catalog-backend';
import { BackstageIdentity } from '@backstage/plugin-auth-backend';
import { SerializableFilterFactory } from '@backstage/permission-common';
import { Entity, EntityRelation } from '../../entity';
import { parseEntityRef, stringifyEntityRef } from '../../entity/ref';
import { RELATION_OWNED_BY } from '../../kinds/relations';
import { EntityName } from '../../types';

export const isEntityOwner: SerializableFilterFactory<
  [BackstageIdentity],
  Entity,
  EntitiesSearchFilter
> = (identity: BackstageIdentity) => {
  // TODO(authorization-framework) eventually all the claims
  // should be pulled off the token and used to evaluate
  // transitive ownership (I own anything owned by my user
  // or any of the groups I'm in).

  return {
    apply: (resource: Entity): boolean => {
      if (!resource.relations) {
        return false;
      }

      return resource.relations
        .filter(
          (relation: EntityRelation) => relation.type === RELATION_OWNED_BY,
        )
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

    serialize: () => ({
      key: RELATION_OWNED_BY,
      matchValueIn: [
        stringifyEntityRef({
          kind: 'user',
          namespace: 'default',
          name: identity.id,
        }),
      ],
    }),
  };
};
