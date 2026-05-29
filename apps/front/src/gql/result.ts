/**
 * Helpers for working with GraphQL result unions.
 *
 * Every query/mutation in the API returns a discriminated union of a success
 * type plus typed rejections (ValidationRejection, UnauthorizedRejection,
 * NotFoundRejection, ForbiddenRejection, InternalErrorRejection). GraphQL
 * always responds with HTTP 200, so rejections arrive as data, not errors.
 *
 * `unwrapResult` narrows such a union to its success member, throwing a
 * `GraphqlRejectionError` for any rejection. Use it inside a react-query
 * `select` (or directly) so components only ever see the success shape.
 */

type WithTypename = { __typename: string }

export type FieldError = { field: string; message: string }

export class GraphqlRejectionError extends Error {
  readonly typename: string
  readonly fieldErrors?: readonly FieldError[]

  constructor(rejection: { __typename: string; message?: string | null; errors?: readonly FieldError[] | null }) {
    super(
      rejection.message ??
        rejection.errors?.map(error => `${error.field}: ${error.message}`).join(', ') ??
        rejection.__typename,
    )
    this.name = 'GraphqlRejectionError'
    this.typename = rejection.__typename
    this.fieldErrors = rejection.errors ?? undefined
  }
}

export function isRejection(value: WithTypename | null | undefined): boolean {
  return !!value && value.__typename.endsWith('Rejection')
}

/**
 * Narrow a GraphQL result union to its success member.
 * Throws a GraphqlRejectionError for any rejection member (or empty result).
 */
export function unwrapResult<R extends WithTypename, K extends R['__typename']>(
  result: R | null | undefined,
  successTypename: K,
): Extract<R, { __typename: K }> {
  if (!result) {
    throw new Error('Empty GraphQL result')
  }
  if (result.__typename === successTypename) {
    return result as Extract<R, { __typename: K }>
  }
  throw new GraphqlRejectionError(result as { __typename: string; message?: string | null })
}

/**
 * Like `unwrapResult` but returns `undefined` instead of throwing for a
 * NotFoundRejection — useful for "fetch by id that may not exist" queries.
 */
export function unwrapResultOrNotFound<R extends WithTypename, K extends R['__typename']>(
  result: R | null | undefined,
  successTypename: K,
): Extract<R, { __typename: K }> | undefined {
  if (result && result.__typename === 'NotFoundRejection') {
    return undefined
  }
  return unwrapResult(result, successTypename)
}
