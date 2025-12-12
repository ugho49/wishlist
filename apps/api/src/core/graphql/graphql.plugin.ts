import type { Plugin } from 'graphql-yoga'

import { Logger } from '@nestjs/common'
import { type GraphQLError, print as graphqlPrint } from 'graphql'

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
      const query = graphqlPrint(args.document)

      logger.log(`Executing GraphQL ${operationType}`, {
        query,
        operationType,
        operationName,
        variables: args.variableValues,
      })

      return {
        onExecuteDone({ result }) {
          if ('errors' in result && result.errors) {
            logger.error(`GraphQL ${operationType} errors`, {
              query,
              operationType,
              operationName,
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
