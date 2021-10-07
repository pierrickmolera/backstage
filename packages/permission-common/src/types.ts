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

import { Filters } from '@backstage/backend-common';
import { JsonValue } from '@backstage/config';
import { Permission, PermissionJSON } from './permissions';

export type Identified<T> = T & { id: string };

export enum AuthorizeResult {
  DENY = 'DENY',
  ALLOW = 'ALLOW',
  MAYBE = 'MAYBE',
}

export type AuthorizeResource = {
  id?: string;
  type: string;
};

export type AuthorizeRequest = {
  permission: Permission;
  resource?: AuthorizeResource;
};

export type OpaqueAuthorizeRequest = {
  permission: Permission;
  resource?: Omit<AuthorizeResource, 'id'>;
};

export type AuthorizeRequestJSON = AuthorizeRequest & {
  permission: PermissionJSON;
};

export type DefinitiveAuthorizeResult = {
  result: AuthorizeResult.ALLOW | AuthorizeResult.DENY;
};

export type ConditionalAuthorizeResult<T> = {
  result: AuthorizeResult.MAYBE;
  conditions: Filters<T>;
};

export type AuthorizeResponse<TFilter extends JsonValue = JsonValue> =
  | DefinitiveAuthorizeResult
  | ConditionalAuthorizeResult<TFilter>;
