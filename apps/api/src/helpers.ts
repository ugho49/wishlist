import type { Params as PinoParams } from 'pino-nestjs'

import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RequestMethod } from '@nestjs/common'
import { kinds, tags, types } from 'dd-trace/ext'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '../..')

export const path = (...paths: string[]) => join(__dirname, ...paths)

const DEFAULT_HEALTHCHECK_PATH = '/health'

export function pinoLoggerConfig(serviceName: string): PinoParams {
  const excludePaths = [DEFAULT_HEALTHCHECK_PATH]
  const pretty = process.env.NODE_ENV !== 'production'

  return {
    pinoHttp: {
      name: serviceName,
      level: 'info',
      messageKey: 'message', // For Datadog
      errorKey: 'error', // For Datadog
      timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
      autoLogging: {
        ignore: req => excludePaths.includes(req.url || ''),
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              messageKey: 'message',
              singleLine: true,
              ignore: 'pid,hostname,context,context_name,service,req,res',
            },
          }
        : undefined,
      formatters: {
        level: (label: string) => ({ level: label }),
        log: ({ responseTime, ...rest }) => ({
          duration: responseTime ? Number(responseTime) / 1000 : undefined,
          ...rest,
        }),
      },
      customAttributeKeys: {
        err: 'error', // For Datadog's error tracking
      },
      customLogLevel: (_message, res, error) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn'
        }
        if (res.statusCode >= 500 || error) {
          return 'error'
        }

        return 'info'
      },
      customSuccessMessage: (req, res) => {
        const { method, url } = req
        const contextString = `[${method}] [${url}]`
        const { statusCode } = res

        return `${contextString} - [${statusCode}] `
      },
      customErrorMessage: (_req, _res, error) => error?.message,
      customProps: (req, res) => {
        const customProps = (res as any).locals ?? {}

        return {
          ...customProps,
          // For Datadog's APM (https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/)
          [tags.RESOURCE_NAME]: req.url,
          [tags.SPAN_TYPE]: types.WEB,
          [tags.SPAN_KIND]: kinds.SERVER,
          [tags.HTTP_STATUS_CODE]: res.writableEnded ? res.statusCode : undefined,
          [tags.HTTP_URL]: req.url,
          [tags.HTTP_METHOD]: req.method,
          [tags.HTTP_USERAGENT]: req.headers['user-agent'],
          'http.version': req.httpVersion,
          context_name: 'express.request',
        }
      },
      redact: {
        paths: ['req.headers', 'res.headers'], // Hide headers on Datadog
        remove: true,
      },
      base: {
        service: serviceName,
      },
    },
    renameContext: 'caller', // For pino-pretty
    exclude: excludePaths.map(path => ({
      method: RequestMethod.ALL,
      path: path,
    })),
  } satisfies PinoParams
}
