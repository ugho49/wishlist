import { ZodError } from 'zod'

export class ZodValidationException extends Error {
  constructor(public readonly zodError: ZodError) {
    super('Validation failed')
    this.name = 'ZodValidationException'
  }
}
