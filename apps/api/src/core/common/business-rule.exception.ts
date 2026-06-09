import { BadRequestException } from '@nestjs/common'

/**
 * Codes must stay in sync with the `BusinessRuleCode` enum in core/graphql/base.graphql.
 */
export const BUSINESS_RULE_CODES = ['WRONG_OLD_PASSWORD'] as const

export type BusinessRuleCode = (typeof BUSINESS_RULE_CODES)[number]

/**
 * A domain business-rule violation that clients can act on programmatically.
 *
 * Extends BadRequestException so REST controllers keep returning 400 with the
 * message, while the GraphQL error plugin maps it to a typed
 * BusinessRuleRejection carrying the code.
 */
export class BusinessRuleException extends BadRequestException {
  constructor(
    public readonly code: BusinessRuleCode,
    message: string,
  ) {
    super(message)
  }
}
