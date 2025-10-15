import type { ExecutionContext } from '@nestjs/common'

import { createParamDecorator, ValidationPipe } from '@nestjs/common'

import { ParseJsonPipe } from './common.pipe'

const TransformDataJsonBody = createParamDecorator((property: string, ctx: ExecutionContext): unknown => {
  const request = ctx.switchToHttp().getRequest()
  return request.body[property]
})

export const ValidJsonBody = (property: string) =>
  TransformDataJsonBody(
    property,
    new ParseJsonPipe(),
    new ValidationPipe({ stopAtFirstError: true, transform: true, validateCustomDecorators: true }),
  )
