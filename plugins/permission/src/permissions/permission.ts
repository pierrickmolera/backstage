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

import { PermissionAttribute } from './attributes';

export type PermissionJSON<T extends string = string> = {
  id: T;
  attributes: PermissionAttribute[];
};

export class Permission<T extends string = string> {
  readonly attributes: Set<PermissionAttribute>;

  constructor(
    readonly id: T,
    attributesIterable?: Iterable<PermissionAttribute>,
  ) {
    this.attributes = new Set(attributesIterable);
  }

  is(permission: Permission<string>) {
    return this.id === permission.id;
  }

  has(attribute: PermissionAttribute) {
    return this.attributes.has(attribute);
  }

  hasAll(...attributes: PermissionAttribute[]) {
    return attributes.every(attribute => this.has(attribute));
  }

  hasSome(...attributes: PermissionAttribute[]) {
    return attributes.some(attribute => this.has(attribute));
  }

  toJSON(): PermissionJSON {
    return { id: this.id, attributes: [...this.attributes] };
  }

  static fromJSON<T extends string = string>({
    id,
    attributes,
  }: PermissionJSON<T>) {
    return new Permission<T>(id, attributes);
  }
}
