import type { Plugin } from 'graphql-yoga'

import { Logger } from '@nestjs/common'
import { type DocumentNode, type GraphQLError, print as graphqlPrint, Kind, visit } from 'graphql'

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
])

const REDACTED = '[REDACTED]'

export function obfuscateQuery(document: DocumentNode): string {
  const sanitizedDoc = visit(document, {
    Argument(node) {
      if (SENSITIVE_FIELDS.has(node.name.value.toLowerCase())) {
        return {
          ...node,
          value: { kind: Kind.STRING, value: REDACTED },
        }
      }
      return undefined
    },
    ObjectField(node) {
      if (SENSITIVE_FIELDS.has(node.name.value.toLowerCase())) {
        return {
          ...node,
          value: { kind: Kind.STRING, value: REDACTED },
        }
      }
      return undefined
    },
  })

  return graphqlPrint(sanitizedDoc)
}

export function obfuscateSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(obfuscateSensitiveData)
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        result[key] = REDACTED
      } else {
        result[key] = obfuscateSensitiveData(value)
      }
    }
    return result
  }

  return data
}

export function useLoggingPlugin(): Plugin {
  const logger = new Logger('GraphQLLoggerPlugin')

  return {
    onExecute({ args }) {
      const operationName = args.operationName || 'anonymous'
      const operation = args.document.definitions.find((def: { kind: string }) => def.kind === 'OperationDefinition')

      if (!operation || operation.kind !== 'OperationDefinition') {
        return
      }

      const operationType = operation.operation
      const query = obfuscateQuery(args.document)
      const variables = obfuscateSensitiveData(args.variableValues)

      const logArgs = {
        query,
        operationType,
        operationName,
        variables,
      }

      logger.log(`Executing GraphQL ${operationType}`, logArgs)

      return {
        onExecuteDone({ result }) {
          if ('errors' in result && result.errors) {
            logger.error(`GraphQL ${operationType} errors`, {
              ...logArgs,
              errors: result.errors.map((e: GraphQLError) => ({
                code: e.extensions?.code,
                message: e.message,
              })),
            })
          }
        },
      }
    },
  }
}
