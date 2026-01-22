import { Type } from '@nestjs/common'
import { createUnionType, Field, InterfaceType, ObjectType } from '@nestjs/graphql'

@InterfaceType({
  description: 'Base interface for all rejection types',
  resolveType: (value: { __typename: string }) => value.__typename,
})
export abstract class Rejection {
  @Field(() => String)
  declare message: string
}

@ObjectType({ implements: () => Rejection })
export class InternalErrorRejection implements Rejection {
  readonly __typename = 'InternalErrorRejection' as const

  @Field(() => String)
  declare message: string

  constructor(message = 'An unexpected error occurred') {
    this.message = message
  }
}

@ObjectType()
export class FieldValidationError {
  @Field(() => String)
  declare field: string

  @Field(() => String)
  declare message: string

  constructor(field: string, message: string) {
    this.field = field
    this.message = message
  }
}

@ObjectType({ implements: () => Rejection })
export class ValidationRejection implements Rejection {
  readonly __typename = 'ValidationRejection' as const

  @Field(() => String)
  declare message: string

  @Field(() => [FieldValidationError])
  declare errors: FieldValidationError[]

  constructor(errors: FieldValidationError[], message = 'Validation failed') {
    this.message = message
    this.errors = errors
  }
}

@ObjectType({ implements: () => Rejection })
export class UnauthorizedRejection implements Rejection {
  readonly __typename = 'UnauthorizedRejection' as const

  @Field(() => String)
  declare message: string

  constructor(message = 'Unauthorized') {
    this.message = message
  }
}

@ObjectType({ implements: () => Rejection })
export class ForbiddenRejection implements Rejection {
  readonly __typename = 'ForbiddenRejection' as const

  @Field(() => String)
  declare message: string

  constructor(message = 'Forbidden') {
    this.message = message
  }
}

/**
 * Creates a GraphQL union type for mutations that includes the success type and all rejection types.
 * Use this for mutations that have input validation.
 *
 * @example
 * const LoginResult = createMutationResult('LoginResult', LoginOutput)
 *
 * @Mutation(() => LoginResult)
 * async login(...): Promise<LoginOutput> { ... }
 */
export function createMutationResult<T extends Type>(name: string, successType: T) {
  return createUnionType({
    name,
    types: () =>
      [successType, ValidationRejection, UnauthorizedRejection, ForbiddenRejection, InternalErrorRejection] as const,
    resolveType: (value: { __typename?: string }) => {
      if (value.__typename === 'ValidationRejection') return ValidationRejection
      if (value.__typename === 'UnauthorizedRejection') return UnauthorizedRejection
      if (value.__typename === 'ForbiddenRejection') return ForbiddenRejection
      if (value.__typename === 'InternalErrorRejection') return InternalErrorRejection
      return successType
    },
  })
}

/**
 * Creates a GraphQL union type for queries that includes the success type and auth rejection types.
 * Use this for protected queries (without @Public decorator).
 *
 * @example
 * const GetUserResult = createQueryResult('GetUserResult', GqlUser)
 *
 * @Query(() => GetUserResult)
 * async getUser(...): Promise<GqlUser> { ... }
 */
export function createQueryResult<T extends Type>(name: string, successType: T) {
  return createUnionType({
    name,
    types: () => [successType, UnauthorizedRejection, ForbiddenRejection, InternalErrorRejection] as const,
    resolveType: (value: { __typename?: string }) => {
      if (value.__typename === 'UnauthorizedRejection') return UnauthorizedRejection
      if (value.__typename === 'ForbiddenRejection') return ForbiddenRejection
      if (value.__typename === 'InternalErrorRejection') return InternalErrorRejection
      return successType
    },
  })
}
