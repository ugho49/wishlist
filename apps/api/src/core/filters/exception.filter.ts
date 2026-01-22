import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import tracer from 'dd-trace'
import { USER_KEEP } from 'dd-trace/ext/priority'
import { Response } from 'express'

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    // Track error with Datadog
    this._trackErrorWithDatadog(exception)

    // Handle based on context type
    const contextType = host.getType<'graphql' | 'http'>()

    if (contextType === 'graphql') {
      // For GraphQL, we just rethrow the exception
      // GraphQL will handle formatting the error response
      // this.logger.error('Unknown error occurred', { exception })
      // if (exception instanceof HttpException) {
      //   throw exception
      // }
      // throw new InternalServerErrorException('An unknown error occurred')
      return {
        __typename: 'InternalErrorRejection',
        message: 'An unexpected error occured',
      }
    }

    // For HTTP/REST requests
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Datadog Error Tracking
    response.err = exception // Will be renamed as `error` by pino

    let status: number
    let body: string | object

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      body = exception.getResponse()
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      body = {
        statusCode: status,
        message: exception.message,
        error: 'Internal Server Error',
      }
    }

    response.status(status).send(body)
  }

  private _trackErrorWithDatadog(error: Error) {
    const span = tracer.scope().active()

    if (span) {
      // biome-ignore lint/suspicious/noExplicitAny: ok
      const spanContext = span.context() as any
      // Hack to force the sampling priority to 1
      spanContext._sampling.priority = USER_KEEP

      // Hack to retrieve the root span from Datadog
      // @see https://github.com/DataDog/dd-trace-js/issues/725
      const rootSpan = spanContext._trace.started[0]
      rootSpan?.setTag('error', error)
    }
  }
}
