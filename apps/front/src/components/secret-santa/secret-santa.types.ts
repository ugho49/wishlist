import type { EventId } from '@wishlist/common'
import type { SecretSantaItemFragment, SecretSantaUserItemFragment } from '../../gql'

/**
 * Shared GraphQL-derived types for the secret-santa feature, re-exported under
 * stable names so the feature's components (and the event feature consuming
 * them) share a single contract that mirrors the `SecretSantaItem` /
 * `SecretSantaUserItem` GraphQL fragments.
 */
export type SecretSantaItem = SecretSantaItemFragment

export type SecretSantaUserItem = SecretSantaUserItemFragment

export type SecretSantaAttendee = SecretSantaUserItemFragment['attendee']

/**
 * Minimal event shape consumed by the secret-santa components. The event
 * feature passes a GraphQL `Event` (or detailed-event) object that structurally
 * satisfies this (camelCase fields, GraphQL `EventAttendee` attendees).
 */
export type SecretSantaEvent = {
  id: EventId
  eventDate: string
  attendees: SecretSantaAttendee[]
}
