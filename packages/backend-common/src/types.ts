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

/**
 * A simple string-based filter, which may be used to match against catalog, search, permissions
 * or other places where filtering based on key/value is desired.
 */
export type Filter = {
  /**
   * The key to match on. For a nested structure, this is expected to be a dot-delimited value (e.g.
   * 'spec.namespace').
   *
   * Matches are always case insensitive.
   */
  key: string;

  /**
   * Match on plain equality of values.
   *
   * If undefined, this factor is not taken into account. Otherwise, match on
   * values that are equal to any of the given array items. Matches are always
   * case insensitive.
   */
  matchValueIn?: string[];

  /**
   * Match on the mere existence of key, regardless of its value.
   */
  matchValueExists?: boolean;
};

/**
 * An expression of multiple filters.
 *
 * Any (at least one) of the outer sets must match, within which all of the
 * individual filters must match.
 */
export type Filters = {
  anyOf: { allOf: Filter[] }[];
};
