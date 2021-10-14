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
import {
  PermissionCondition,
  PermissionRule,
} from '@backstage/permission-common';
import express, { Router } from 'express';

type ApplyRequest = {
  resourceRef: string;
  resourceType: string;
  filters: Filters<PermissionCondition<unknown[]>>;
};

type Condition<TRule> = TRule extends PermissionRule<any, any, infer TParams>
  ? (...params: TParams) => PermissionCondition<TParams>
  : never;

type Conditions<TRules extends Record<string, PermissionRule<any, any>>> = {
  [Name in keyof TRules]: Condition<TRules[Name]>;
};

type FilterType<TRules> = TRules extends Record<
  string,
  PermissionRule<any, infer TFilter, any>
>
  ? TFilter
  : never;

export const createPermissionIntegration = <
  TResource,
  TRules extends { [key: string]: PermissionRule<TResource, any> },
  TGetResourceParams extends any[] = [],
>({
  pluginId,
  resourceType,
  rules,
  getResource,
}: {
  pluginId: string;
  resourceType: string;
  rules: TRules;
  getResource: (
    resourceRef: string,
    ...params: TGetResourceParams
  ) => Promise<TResource | undefined>;
}): {
  createPermissionIntegrationRouter: (...params: TGetResourceParams) => Router;
  toFilters: (
    conditions: Filters<PermissionCondition>,
  ) => Filters<FilterType<TRules>>;
  conditions: Conditions<TRules>;
  createConditions: (conditions: Filters<PermissionCondition>) => {
    pluginId: string;
    resourceType: string;
    conditions: Filters<PermissionCondition>;
  };
} => {
  const getRule = (
    name: string,
  ): PermissionRule<TResource, FilterType<TRules>> => {
    const rule = Object.values(rules).find(r => r.name === name);

    if (!rule) {
      throw new Error(`Unexpected permission rule: ${name}`);
    }

    return rule;
  };

  return {
    createPermissionIntegrationRouter: (
      ...getResourceParams: TGetResourceParams
    ) => {
      const router = Router();

      router.use('/permissions/', express.json());

      router.post('/permissions/apply-conditions', async (req, res) => {
        // TODO(authorization-framework): validate input
        const body = req.body as ApplyRequest;

        if (body.resourceType !== resourceType) {
          throw new Error(`Unexpected resource type: ${body.resourceType}`);
        }

        const resource = await getResource(
          body.resourceRef,
          ...getResourceParams,
        );

        if (!resource) {
          return res.status(400).end();
        }

        const allowed = body.filters.anyOf.some(({ allOf }) =>
          allOf.every(({ rule, params }) =>
            getRule(rule).apply(resource, ...params),
          ),
        );

        return res.status(200).json({ allowed });
      });

      return router;
    },
    toFilters: (
      conditions: Filters<PermissionCondition>,
    ): Filters<FilterType<TRules>> => ({
      anyOf: conditions.anyOf.map(({ allOf }) => ({
        allOf: allOf.map(({ rule, params }) =>
          getRule(rule).toQuery(...params),
        ),
      })),
    }),
    conditions: Object.entries(rules).reduce(
      (acc, [key, rule]) => ({
        ...acc,
        [key]: (...params) => ({
          rule: rule.name,
          params,
        }),
      }),
      {} as Conditions<TRules>,
    ),
    createConditions: (conditions: Filters<PermissionCondition>) => ({
      pluginId,
      resourceType,
      conditions,
    }),
  };
};
