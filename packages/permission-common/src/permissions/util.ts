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

import { Filters, PluginEndpointDiscovery } from '@backstage/backend-common';
import { ConflictError } from '@backstage/errors';
import {
  DefinitiveAuthorizeResult,
  AuthorizeResponse,
  AuthorizeResult,
} from '../types';
import { Permission, PermissionJSON } from './permission';

type PermissionMethods<T extends string> = {
  get: (key: T) => Permission;
  includes: (permission: Permission) => boolean;
};

export const createPermissions = <T extends string>(
  permissions: Record<T, PermissionJSON>,
): Record<T, Permission> & PermissionMethods<T> => {
  const permissionsByKey = Object.entries<PermissionJSON>(permissions).reduce<
    Record<T, Permission>
  >(
    (acc, [key, permission]) => ({
      ...acc,
      [key]: Permission.fromJSON(permission),
    }),
    {} as Record<T, Permission>,
  );

  return {
    ...permissionsByKey,
    get: (key: T) => permissionsByKey[key],
    includes: (permission: Permission) => {
      return Object.values<Permission>(permissionsByKey).some(
        p => p.name === permission.name,
      );
    },
  };
};

export type SerializableFilter<TResource, TFilter> = {
  apply: (resource: TResource) => boolean;
  serialize: () => TFilter;
};

export type SerializableFilterFactory<
  TParams extends any[],
  TResource,
  TFilter,
> = (...params: TParams) => SerializableFilter<TResource, TFilter>;

export abstract class ResourceFilterDefinition<TResource = any, TFilter = any> {
  constructor(
    public filters: Filters<SerializableFilter<TResource, TFilter>>,
  ) {}

  abstract getResourceType(): string;

  abstract getResource(
    resourceRef: string,
    env: { discoveryApi: PluginEndpointDiscovery },
  ): Promise<TResource | undefined>;

  async apply(
    resourceRef: string,
    env: { discoveryApi: PluginEndpointDiscovery },
  ): Promise<DefinitiveAuthorizeResult> {
    const resource = await this.getResource(resourceRef, env);

    if (!resource) {
      // TODO(authorization-framework): this should probably be a DENY
      // to prevent the api being used to fish for valid resource refs.
      throw new ConflictError(
        'Authorization requested for non-existent resource',
      );
    }

    return {
      result: this.filters.anyOf.some(anyOf =>
        anyOf.allOf.every(filter => filter.apply(resource)),
      )
        ? AuthorizeResult.ALLOW
        : AuthorizeResult.DENY,
    };
  }

  serialize(): AuthorizeResponse {
    return {
      result: AuthorizeResult.MAYBE,
      filters: {
        anyOf: this.filters.anyOf.map(({ allOf }) => ({
          allOf: allOf.map(x => x.serialize()),
        })),
      },
    };
  }
}
