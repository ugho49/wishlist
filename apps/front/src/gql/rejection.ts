/**
 * Helpers for working with GraphQL result unions.
 *
 * Every query/mutation in the API returns a discriminated union of a success
 * type plus typed rejections (ValidationRejection, UnauthorizedRejection,
 * NotFoundRejection, ForbiddenRejection, InternalErrorRejection). GraphQL
 * always responds with HTTP 200, so rejections arrive as data, not errors:
 * every call site must narrow the union and decide what UI each case gets.
 *
 * Call sites match results with ts-pattern: success member(s) and noteworthy
 * rejections get their own `.with()` case, `rejectionPattern` catches the
 * remaining rejections with `rejectionMessage` as default user-facing message,
 * and `.exhaustive()` guarantees no case is ever missed:
 *
 *   match(res.changeUserPassword)
 *     .with({ __typename: 'VoidOutput' }, () => ...)
 *     .with({ __typename: 'ValidationRejection' }, () => ...)
 *     .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
 *     .exhaustive()
 *
 * `isRejection` narrows a result union outside of match expressions (e.g.
 * deriving query data).
 */

import { P } from 'ts-pattern'

const REJECTION_TYPENAMES = [
  'ValidationRejection',
  'BusinessRuleRejection',
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

/**
 * ts-pattern pattern matching every rejection member of a result union,
 * whatever subset of rejection types the union declares.
 */
export const rejectionPattern = { __typename: P.string.endsWith('Rejection') } as const

const DEFAULT_MESSAGES: Record<RejectionTypename, string> = {
  ValidationRejection: 'Certaines informations saisies sont invalides',
  BusinessRuleRejection: 'Cette action ne peut pas être effectuée',
  UnauthorizedRejection: 'Vous devez être connecté pour effectuer cette action',
  ForbiddenRejection: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
  NotFoundRejection: "Cette ressource n'existe pas ou a été supprimée",
  InternalErrorRejection: "Une erreur s'est produite. Veuillez réessayer plus tard",
}

export function rejectionMessage(rejection: { __typename: RejectionTypename }): string {
  return DEFAULT_MESSAGES[rejection.__typename]
}
