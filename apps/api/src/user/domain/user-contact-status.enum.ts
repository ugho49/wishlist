/**
 * What a user decided about someone of their friends:
 * - `added`: added by email, part of their circle even without a shared event
 * - `hidden`: out of their circle and of the picker suggestions, even when they share events
 */
export enum UserContactStatus {
  ADDED = 'added',
  HIDDEN = 'hidden',
}
