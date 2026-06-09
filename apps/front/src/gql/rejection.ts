/**
 * Helpers for working with GraphQL result unions.
 *
 * Every query/mutation in the API returns a discriminated union of a success
 * type plus typed rejections (ValidationRejection, UnauthorizedRejection,
 * NotFoundRejection, ForbiddenRejection, InternalErrorRejection). GraphQL
 * always responds with HTTP 200, so rejections arrive as data, not errors:
 * every call site must narrow the union and decide what UI each case gets.
 *
 * `isRejection` narrows a result to its rejection members (and, in the false
 * branch, to its success members). `rejectionMessage` gives the default
 * user-facing message for a rejection; call sites with more context should
 * handle specific `__typename` cases before falling back to it.
 */

const REJECTION_TYPENAMES = [
  'ValidationRejection',
  'UnauthorizedRejection',
  'ForbiddenRejection',
  'NotFoundRejection',
  'InternalErrorRejection',
] as const

export type RejectionTypename = (typeof REJECTION_TYPENAMES)[number]

type WithTypename = { __typename: string }

export type RejectionOf<R extends WithTypename> = Extract<R, { __typename: RejectionTypename }>
export type SuccessOf<R extends WithTypename> = Exclude<R, { __typename: RejectionTypename }>

export function isRejection<R extends WithTypename>(result: R): result is RejectionOf<R> {
  return (REJECTION_TYPENAMES as readonly string[]).includes(result.__typename)
}

const DEFAULT_MESSAGES: Record<RejectionTypename, string> = {
  ValidationRejection: 'Certaines informations saisies sont invalides',
  UnauthorizedRejection: 'Vous devez être connecté pour effectuer cette action',
  ForbiddenRejection: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
  NotFoundRejection: "Cette ressource n'existe pas ou a été supprimée",
  InternalErrorRejection: "Une erreur s'est produite. Veuillez réessayer plus tard",
}

export function rejectionMessage(rejection: { __typename: RejectionTypename }): string {
  return DEFAULT_MESSAGES[rejection.__typename]
}
