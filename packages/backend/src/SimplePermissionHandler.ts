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
  BackstageIdentity,
  getIdentityClaims,
} from '@backstage/plugin-auth-backend';
import {
  AuthorizeResult,
  OpaqueAuthorizeRequest,
  PermissionCondition,
  PermissionRule,
  TechDocsPermission,
} from '@backstage/permission-common';
import {
  Conditions,
  HandlerResult,
  PermissionHandler,
} from '@backstage/plugin-permission-backend';
import {
  conditions as catalogConditions,
  createConditions as createCatalogConditions,
  EntitiesSearchFilter,
} from '@backstage/plugin-catalog-backend';
import {
  ComponentEntityV1alpha1,
  Entity,
  RESOURCE_TYPE_CATALOG_ENTITY,
} from '@backstage/catalog-model';

const { isEntityOwner, isEntityKind } = catalogConditions;

const isComponentType = {
  name: 'IS_COMPONENT_TYPE',
  description: 'Allow entities with type component',
  apply(resource: Entity, componentTypes: string[]) {
    if (resource.kind.toLocaleLowerCase('en-US') === 'component') {
      return componentTypes.includes(
        (resource as ComponentEntityV1alpha1).spec.type.toLocaleLowerCase(
          'en-US',
        ),
      );
    }
    return false;
  },
  // TODO: this condition has two separate requirements that need to be true
  // Might need to change toQuery to return a complete Filters object
  toQuery(componentTypes: string[]): EntitiesSearchFilter {
    return {
      key: 'spec.type',
      matchValueIn: componentTypes.map(type => type.toLocaleLowerCase('en-US')),
    };
  },
};

export class SimplePermissionHandler implements PermissionHandler {
  private readonly isComponentType: (
    componentTypes: string[],
  ) => PermissionCondition<[componentTypes: string[]]>;
  constructor(
    extendRulesWith: <
      TExtensionRules extends { [key: string]: PermissionRule<Entity, any> },
    >(
      rules: TExtensionRules,
    ) => Conditions<TExtensionRules>,
  ) {
    this.isComponentType = extendRulesWith({ isComponentType }).isComponentType;
  }

  async handle(
    request: OpaqueAuthorizeRequest,
    identity?: BackstageIdentity,
  ): Promise<HandlerResult> {
    if (TechDocsPermission.includes(request.permission)) {
      return {
        result: AuthorizeResult.DENY,
      };
    }

    if (request.permission.resourceType === RESOURCE_TYPE_CATALOG_ENTITY) {
      if (!identity) {
        return {
          result: AuthorizeResult.DENY,
        };
      }

      if (request.permission.isRead) {
        return {
          result: AuthorizeResult.MAYBE,
          conditions: createCatalogConditions({
            anyOf: [
              {
                allOf: [
                  // isEntityOwner(getIdentityClaims(identity)),
                  this.isComponentType(['service']),
                ],
              },
              {
                allOf: [isEntityKind(['template'])],
              },
            ],
          }),
        };
      }

      return {
        result: AuthorizeResult.MAYBE,
        conditions: createCatalogConditions({
          anyOf: [
            {
              allOf: [isEntityOwner(getIdentityClaims(identity))],
            },
            // TODO(authorization-framework) we probably need the ability
            // to do negative matching (i.e. exclude all entities of type X)
          ],
        }),
      };
    }

    if (identity) {
      return {
        result: AuthorizeResult.ALLOW,
      };
    }

    return {
      result: AuthorizeResult.DENY,
    };
  }
}
