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
import { Entity } from '@backstage/catalog-model';
import {
  FilterResolver,
  PermissionCondition,
  PermissionRule,
} from '@backstage/permission-common';
import { EntitiesSearchFilter } from '../../catalog/types';

export const hasAnnotationRule: PermissionRule = {
  name: 'HAS_ANNOTATION',
  description:
    'Allow entities which are annotated with the specified annotation',
};

export function hasAnnotation(annotation: string): PermissionCondition {
  return {
    rule: hasAnnotationRule.name,
    params: annotation,
  };
}

export const hasAnnotationMatcher: FilterResolver<
  Entity,
  EntitiesSearchFilter,
  [string]
> = {
  name: 'HAS_ANNOTATION',
  apply: (resource: Entity, annotation: string) =>
    !!resource.metadata.annotations?.hasOwnProperty(annotation[0]),

  serialize: (annotation: string) => ({
    key: annotation,
    matchValueExists: true,
  }),
};
