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
  CRUDAction,
  AuthorizeRequestContext,
  IdentifiedAuthorizeRequest,
  IdentifiedAuthorizeResponse,
} from '@backstage/permission-common';
import { PermissionHandler } from '@backstage/plugin-permission-backend';

export class SimplePermissionHandler implements PermissionHandler {
  async handle(
    requests: Array<IdentifiedAuthorizeRequest<AuthorizeRequestContext>>,
    identity?: BackstageIdentity,
  ): Promise<Array<IdentifiedAuthorizeResponse>> {
    const response = requests.map(request => {
      if (identity) {
        return {
          id: request.id,
          result: AuthorizeResult.ALLOW,
        };
      }

      if (request.permission.attributes.CRUD_ACTION === CRUDAction.READ) {
        return {
          id: request.id,
          result: AuthorizeResult.ALLOW,
        };
      }

      return {
        id: request.id,
        result: AuthorizeResult.DENY,
      };
    });
    return response;
  }
}
