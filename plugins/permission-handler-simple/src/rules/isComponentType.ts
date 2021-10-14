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

import { ComponentEntityV1alpha1, Entity } from '@backstage/catalog-model';
import { EntitiesSearchFilter } from '@backstage/plugin-catalog-backend';

export const isComponentType = {
  name: 'IS_COMPONENT_TYPE',
  description: 'Allow entities with type component',
  apply(resource: Entity, componentTypes: string[]) {
    if (resource.kind.toLocaleLowerCase('en-US') === 'component') {
      return componentTypes.includes(
        (resource as ComponentEntityV1alpha1).spec.type.toLocaleLowerCase(
          'en-US',
        ),
      );
    }

    return false;
  },
  // TODO: this condition has two separate requirements that need to be true
  // Might need to change toQuery to return a complete Filters object
  toQuery(componentTypes: string[]): EntitiesSearchFilter {
    return {
      key: 'spec.type',
      matchValueIn: componentTypes.map(type => type.toLocaleLowerCase('en-US')),
    };
  },
};
