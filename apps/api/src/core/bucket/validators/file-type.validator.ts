import type { FileTypeValidatorOptions as NestFileTypeValidatorOptions } from '@nestjs/common'

import { FileTypeValidator as NestFileTypeValidator } from '@nestjs/common'

export type FileTypeValidatorOptions = NestFileTypeValidatorOptions & {
  errorMessage?: string
}

export class FileTypeValidator extends NestFileTypeValidator {
  constructor(private readonly options: FileTypeValidatorOptions) {
    super(options)
  }

  override buildErrorMessage(): string {
    return this.options.errorMessage ? this.options.errorMessage : super.buildErrorMessage()
  }
}
