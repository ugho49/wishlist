import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host)

    // Handle HTTP exceptions (from NestJS)
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()

      return new GraphQLError(
        typeof response === 'string' ? response : (response as any).message || exception.message,
        {
          extensions: {
            code: this.getErrorCode(status),
            statusCode: status,
          },
        },
      )
    }

    // Handle standard errors
    if (exception instanceof Error) {
      return new GraphQLError(exception.message, {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      })
    }

    // Fallback for unknown errors
    return new GraphQLError('An unexpected error occurred', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    })
  }

  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST'
      case 401:
        return 'UNAUTHENTICATED'
      case 403:
        return 'FORBIDDEN'
      case 404:
        return 'NOT_FOUND'
      case 409:
        return 'CONFLICT'
      case 422:
        return 'UNPROCESSABLE_CONTENT'
      default:
        return 'INTERNAL_SERVER_ERROR'
    }
  }
}
