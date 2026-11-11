import type { GraphQLContext } from '@znight/graphql';

import { Hooks, Injectable, type OnStart } from '@znight/core';
import { getLogger } from '@znight/observability';
import { type DocumentNode, print as graphqlPrint, Kind, visit } from 'graphql';

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'authorization',
  'credential',
  'credentials',
  'currentpassword',
  'newpassword',
]);

const REDACTED = '[REDACTED]';

export function obfuscateQuery(document: DocumentNode): string {
  const sanitizedDoc = visit(document, {
    Argument(node) {
      if (SENSITIVE_FIELDS.has(node.name.value.toLowerCase())) {
        return {
          ...node,
          value: { kind: Kind.STRING, value: REDACTED },
        };
      }
    },
    ObjectField(node) {
      if (SENSITIVE_FIELDS.has(node.name.value.toLowerCase())) {
        return {
          ...node,
          value: { kind: Kind.STRING, value: REDACTED },
        };
      }
    },
  });

  return graphqlPrint(sanitizedDoc);
}

export function obfuscateSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(obfuscateSensitiveData);
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        result[key] = REDACTED;
      } else {
        result[key] = obfuscateSensitiveData(value);
      }
    }
    return result;
  }

  return data;
}

/**
 * One log entry per GraphQL operation, with the redacted query and variables (the previous Yoga
 * logging plugin).
 */
@Injectable()
export class GraphQLOperationLogger implements OnStart {
  private readonly logger = getLogger('GraphQLLoggerPlugin');

  constructor(private readonly hooks: Hooks) {}

  onStart(): void {
    this.hooks.on('graphql:operation', event => {
      const context = event.context as GraphQLContext | undefined;
      const document = context?.document;
      const logArgs = {
        query: document ? obfuscateQuery(document) : undefined,
        operationType: event.operationType,
        operationName: event.operationName ?? 'anonymous',
        variables: obfuscateSensitiveData(context?.variables),
      };

      if (event.errors && event.errors.length > 0) {
        this.logger.error(`GraphQL ${event.operationType} errors`, {
          ...logArgs,
          errors: event.errors.map(error => ({ code: error.code, message: error.message })),
        });
        return;
      }

      this.logger.info(`Executed GraphQL ${event.operationType}`, logArgs);
    });
  }
}
