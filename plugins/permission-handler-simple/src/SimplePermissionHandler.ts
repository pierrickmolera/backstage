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
  AuthorizeRequest,
  AuthorizeResult,
  AuthorizeResponse,
  CRUDAction,
} from '@backstage/permission-common';
import { PermissionHandler } from '@backstage/plugin-permission-backend';

export class SimplePermissionHandler implements PermissionHandler<any> {
  async handle(
    request: AuthorizeRequest<any>,
    identity?: BackstageIdentity,
  ): Promise<AuthorizeResponse> {
    if (identity) {
      return {
        // TODO: why does this enum work? It's a frontend package. Should move to a common package.
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
}
