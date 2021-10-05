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
import {
  AuthorizeResult,
  AuthorizeRequest,
  TechDocsPermission,
} from '@backstage/permission-common';
import {
  HandlerResult,
  PermissionHandler,
} from '@backstage/plugin-permission-backend';
import {
  CatalogEntityFilterDefinition,
  isEntityOwner,
  hasAnnotation,
  isEntityKind,
  RESOURCE_TYPE_CATALOG_ENTITY,
} from '@backstage/catalog-model';

export class SimplePermissionHandler implements PermissionHandler {
  async handle(
    request: AuthorizeRequest,
    identity?: BackstageIdentity,
  ): Promise<HandlerResult> {
    if (TechDocsPermission.includes(request.permission)) {
      return {
        result: AuthorizeResult.DENY,
      };
    }

    if (request.resource?.type === RESOURCE_TYPE_CATALOG_ENTITY) {
      if (!identity) {
        return {
          result: AuthorizeResult.DENY,
        } as any;
      }

      return {
        result: AuthorizeResult.MAYBE,
        conditions: new CatalogEntityFilterDefinition({
          anyOf: [
            {
              allOf: [
                isEntityOwner(identity),
                hasAnnotation('backstage.io/view-url'),
              ],
            },
            {
              allOf: [isEntityKind(['template'])],
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
      } as any;
    }

    return {
      result: AuthorizeResult.DENY,
    } as any;
  }
}
