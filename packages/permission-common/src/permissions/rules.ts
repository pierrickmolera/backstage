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

export type PermissionCondition<Params> = {
  rule: string;
  params: Params;
};

export type PermissionRule<Resource, Params, Query> = {
  name: string;
  description: string;
  apply(resource: Resource, params: Params): boolean;
  toQuery(params: Params): Query;
  bind(params: Params): PermissionCondition<Params>;
};

export type PermissionRuleConfig<Resource, Params, Query> = Omit<
  PermissionRule<Resource, Params, Query>,
  'bind'
>;

export function createPermissionRule<Resource, Params, Query>(
  config: PermissionRuleConfig<Resource, Params, Query>,
): PermissionRule<Resource, Params, Query> {
  return {
    ...config,
    bind(params) {
      return {
        rule: config.name,
        params,
      };
    },
  };
}

export type PermissionRulesOptions<Resource, Query> = {
  rules: PermissionRule<Resource, any, Query>[];
};

export class PermissionRules<Resource, Query> {
  constructor(
    private readonly options: PermissionRulesOptions<Resource, Query>,
  ) {}

  apply(
    resource: Resource,
    filters: Filters<PermissionCondition<any>>,
  ): boolean {
    return filters.anyOf.some(({ allOf }) =>
      allOf.every(condition =>
        this.getRule(condition.rule).apply(resource, condition.params),
      ),
    );
  }

  toFilters(conditions: Filters<PermissionCondition<any>>): Filters<Query> {
    return {
      anyOf: conditions.anyOf.map(({ allOf }) => ({
        allOf: allOf.map(condition =>
          this.getRule(condition.rule).toQuery(condition.params),
        ),
      })),
    };
  }

  private getRule(name: string): PermissionRule<Resource, any, Query> {
    const rule = this.options.rules.find(r => r.name === name);
    if (!rule) {
      throw new Error(`Unexpected permission rule: ${name}`);
    }
    return rule;
  }
}
