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

import { ApiRef, createApiRef } from '@backstage/core-plugin-api';
import { PermissionApi as BasePermissionApi } from '@backstage/plugin-permission';
import { EntityName } from '@backstage/catalog-model';

export type EntityContext = {
  // TODO(mtlewis/orkohunter): Think about passing ONLY entity ref instead of all of entity, and all the relations are fetched from Catalog backend.
  entityName: EntityName;
};

export class PermissionApi extends BasePermissionApi<EntityContext> {}

export const permissionApiRef: ApiRef<PermissionApi> = createApiRef({
  id: 'plugin.permission',
});
