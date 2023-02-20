import {
  MaxFileSizeValidatorOptions as NestMaxFileSizeValidatorOptions,
  MaxFileSizeValidator as NestMaxFileSizeValidator,
} from '@nestjs/common';

export type MaxFileSizeValidatorOptions = NestMaxFileSizeValidatorOptions & {
  errorMessage?: string;
};

export class MaxFileSizeValidator extends NestMaxFileSizeValidator {
  constructor(private readonly options: MaxFileSizeValidatorOptions) {
    super(options);
  }

  override buildErrorMessage(): string {
    return this.options.errorMessage ? this.options.errorMessage : super.buildErrorMessage();
  }
}
