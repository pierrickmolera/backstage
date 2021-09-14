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

import { Filter } from '@backstage/backend-common';
import { Permission, PermissionJSON } from './permissions';

export enum AuthorizeResult {
  DENY = 'DENY',
  ALLOW = 'ALLOW',
  MAYBE = 'MAYBE',
}

export type AuthorizeRequestContext = Record<string, any>;

export type AuthorizeRequest<T extends AuthorizeRequestContext> = {
  permission: Permission;
  context?: T;
};

export type IdentifiedAuthorizeRequest<T extends AuthorizeRequestContext> =
  AuthorizeRequest<T> & {
    id: string;
  };

export type AuthorizeResponse = {
  result: AuthorizeResult.ALLOW | AuthorizeResult.DENY;
};

export type AuthorizeFiltersResponse =
  | AuthorizeResponse
  | {
      result: AuthorizeResult.MAYBE;
      conditions: Filter[];
    };

export type IdentifiedAuthorizeResponse = AuthorizeResponse & {
  id: string;
};

export type IdentifiedAuthorizeRequestJSON<
  T extends AuthorizeRequestContext = AuthorizeRequestContext,
> = {
  id: string;
  permission: PermissionJSON;
  context: T;
};
