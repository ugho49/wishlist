import type { ZodType } from 'zod'

import { Injectable, PipeTransform } from '@nestjs/common'

import { ZodValidationException } from './zod-validation.exception'

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new ZodValidationException(result.error)
    }
    return result.data
  }
}
