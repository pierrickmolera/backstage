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
  AuthorizeRequest,
  AuthorizeRequestContext,
  AuthorizeResponse,
  AuthorizeResult,
} from '@backstage/permission-common';
import { BackstageIdentity } from '@backstage/plugin-auth-backend';
import { PermissionHandler } from './types';

// TODO(mtlewis/orkuhunter): Maybe we can find a clearer name for this?
// "AllowAllPermissionHander"? "UnrestrictedPermissionHandler"?
export class NoopPermissionHandler implements PermissionHandler {
  async handle(
    _request: AuthorizeRequest<AuthorizeRequestContext>,
    _user?: BackstageIdentity,
  ): Promise<AuthorizeResponse> {
    return {
      result: AuthorizeResult.ALLOW,
    };
  }
}
