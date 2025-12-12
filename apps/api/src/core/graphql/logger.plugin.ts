import { ApolloServerPlugin } from '@apollo/server'
import { Plugin } from '@nestjs/apollo'
import { Logger } from '@nestjs/common'
import { print as graphqlPrint } from 'graphql'

@Plugin()
export class GraphQLLoggerPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(GraphQLLoggerPlugin.name)

  requestDidStart() {
    return Promise.resolve({
      // biome-ignore lint/suspicious/noExplicitAny: GraphQL request context
      didResolveOperation: (requestContext: any) => {
        const { request, operation } = requestContext
        const operationType = operation?.operation || 'unknown'
        const operationName = request.operationName || 'anonymous'

        // Convert the GraphQL document to a string
        const query = operation ? graphqlPrint(operation) : request.query || 'unknown'

        this.logger.log(`Executing GraphQL ${operationType}`, {
          query,
          operationType,
          operationName,
          variables: request.variables,
        })

        return Promise.resolve()
      },
      // biome-ignore lint/suspicious/noExplicitAny: GraphQL request context
      willSendResponse: (requestContext: any) => {
        const { response, operation, request } = requestContext
        const operationType = operation?.operation || 'unknown'
        const operationName = request.operationName || 'anonymous'

        // Log errors if any
        if (response.body.kind === 'single' && response.body.singleResult.errors) {
          const errors = response.body.singleResult.errors
          const query = operation ? graphqlPrint(operation) : request.query || 'unknown'

          this.logger.error(`GraphQL ${operationType} errors`, {
            query,
            operationType,
            operationName,
            // biome-ignore lint/suspicious/noExplicitAny: GraphQL error type
            errors: errors.map((e: any) => ({ code: e.extensions?.code, message: e.message })),
          })
        }

        return Promise.resolve()
      },
    })
  }
}
