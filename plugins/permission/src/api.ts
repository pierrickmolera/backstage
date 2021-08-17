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
  ApiRef,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { PermissionClient } from './client';

export enum AuthorizeResult {
  DENY = 'DENY',
  ALLOW = 'ALLOW',
}

export type AuthorizeRequestContext = Record<string, any>;

export type AuthorizeRequest<
  T extends AuthorizeRequestContext = AuthorizeRequestContext,
> = {
  // TODO(mtlewis/orkohunter): Should `permission`'s type be a string or a literal type composed of available permission strings?
  permission: string;
  context: T;
};

export type AuthorizeResponse = {
  result: AuthorizeResult;
};

export interface PermissionApi<
  T extends AuthorizeRequestContext = AuthorizeRequestContext,
> {
  authorize(options: AuthorizeRequest<T>): Promise<AuthorizeResponse>;
}

export class IdentityAwarePermissionApi<
  T extends AuthorizeRequestContext = AuthorizeRequestContext,
> implements PermissionApi<T>
{
  private readonly permissionClient: PermissionClient;

  constructor(
    discoveryApi: DiscoveryApi,
    private readonly identityApi: IdentityApi,
  ) {
    this.permissionClient = new PermissionClient<T>({ discoveryApi });
  }

  async authorize(options: AuthorizeRequest<T>): Promise<AuthorizeResponse> {
    return (
      await this.permissionClient.authorize([options], {
        token: await this.identityApi.getIdToken(),
      })
    )[0];
  }
}

export const permissionApiRef: ApiRef<PermissionApi> = createApiRef({
  id: 'plugin.permission',
});
