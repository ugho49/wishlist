import {
  MaxFileSizeValidator as NestMaxFileSizeValidator,
  MaxFileSizeValidatorOptions as NestMaxFileSizeValidatorOptions,
} from '@nestjs/common'

export type MaxFileSizeValidatorOptions = NestMaxFileSizeValidatorOptions & {
  errorMessage?: string
}

export class MaxFileSizeValidator extends NestMaxFileSizeValidator {
  constructor(private readonly options: MaxFileSizeValidatorOptions) {
    super(options)
  }

  override buildErrorMessage(): string {
    return this.options.errorMessage ? this.options.errorMessage : super.buildErrorMessage()
  }
}
