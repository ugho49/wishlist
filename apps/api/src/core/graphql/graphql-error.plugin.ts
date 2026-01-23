import { ForbiddenException, HttpException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Plugin } from 'graphql-yoga'

import { Rejection } from './rejection.types'
import { ZodValidationException } from './zod-validation.exception'

function transformException(exception: Error): Rejection {
  const logger = new Logger('GraphQLErrorPlugin')

  if (exception instanceof ZodValidationException) {
    const errors = exception.zodError.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

    return {
      __typename: 'ValidationRejection',
      errors,
    }
  }

  // Handle UnauthorizedException
  if (exception instanceof UnauthorizedException) {
    const response = exception.getResponse()
    const message = typeof response === 'string' ? response : (response as { message?: string }).message
    return {
      __typename: 'UnauthorizedRejection',
      message: message ?? 'Unauthorized',
    }
  }

  // Handle NotFoundException
  if (exception instanceof NotFoundException) {
    return {
      __typename: 'NotFoundRejection',
      message: exception.message ?? 'Not found',
    }
  }

  // Handle ForbiddenException
  if (exception instanceof ForbiddenException) {
    const response = exception.getResponse()
    const message = typeof response === 'string' ? response : (response as { message?: string }).message
    return {
      __typename: 'ForbiddenRejection',
      message: message ?? 'Forbidden',
    }
  }

  // Handle other HttpExceptions
  if (exception instanceof HttpException) {
    const response = exception.getResponse() as { message?: string | string[] }
    const message = Array.isArray(response.message) ? response.message.join(', ') : response.message
    return {
      __typename: 'InternalErrorRejection',
      message: message ?? 'An unexpected error occurred',
    }
  }

  logger.error('An unexpected error occurred', { exception })

  return {
    __typename: 'InternalErrorRejection',
    message: 'An unexpected error occurred',
  }
}

export function useErrorTransformPlugin(): Plugin {
  return {
    onExecute() {
      return {
        onExecuteDone({ result, setResult }) {
          if ('errors' in result && result.errors && result.errors.length > 0) {
            // Find the first error with a path (indicates it's from a resolver)
            const resolverError = result.errors.find(error => error.path && error.path.length > 0)

            if (resolverError) {
              const fieldName = resolverError.path?.[0] as string

              if (fieldName) {
                const errorToTransform = resolverError.originalError || resolverError
                const rejection = transformException(errorToTransform as Error)

                setResult({
                  data: {
                    [fieldName]: rejection,
                  },
                })
              }
            }
          }
        },
      }
    },
  }
}
