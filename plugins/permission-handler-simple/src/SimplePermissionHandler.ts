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
  AuthorizeFiltersResponse,
  AuthorizeResult,
  CRUDAction,
  AuthorizeRequestContext,
  AuthorizeRequest,
  AuthorizeResponse,
} from '@backstage/permission-common';
import { PermissionHandler } from '@backstage/plugin-permission-backend';
import { parseEntityName, stringifyEntityRef } from '@backstage/catalog-model';

export class SimplePermissionHandler implements PermissionHandler {
  async handle(
    request: AuthorizeRequest<AuthorizeRequestContext>,
    identity?: BackstageIdentity,
  ): Promise<AuthorizeResponse> {
    if (identity) {
      return {
        result: AuthorizeResult.ALLOW,
      };
    }

    if (request.permission.attributes.CRUD_ACTION === CRUDAction.READ) {
      return {
        result: AuthorizeResult.ALLOW,
      };
    }

    return {
      result: AuthorizeResult.DENY,
    };
  }

  async authorizeFilters(
    _request: AuthorizeRequest<AuthorizeRequestContext>,
    identity?: BackstageIdentity,
  ): Promise<AuthorizeFiltersResponse> {
    if (identity?.id) {
      // TODO(authorization-framework): need a nicer pattern here, builder?
      return {
        result: AuthorizeResult.MAYBE,
        conditions: {
          anyOf: [
            {
              allOf: [
                {
                  key: 'relations.ownedBy',
                  matchValueIn: [
                    stringifyEntityRef(
                      parseEntityName(identity.id, {
                        defaultKind: 'User',
                        defaultNamespace: 'default',
                      }),
                    ),
                  ],
                },
              ],
            },
          ],
        },
      };
    }
    return {
      result: AuthorizeResult.DENY,
    };
  }
}
