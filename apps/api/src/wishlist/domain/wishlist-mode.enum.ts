/**
 * What the managers (owner and co-owner) of a list see. Every participant of the list's events sees the list
 * and who reserved what in both modes: only the managers' view changes.
 *
 * Who can access the list (event participants, a public link...) is another concern: keep it out of this enum.
 */
export enum WishlistMode {
  /** The managers do not see who reserved what, nor the items suggested by the others. A list for oneself. */
  SURPRISE = 'surprise',
  /** The managers see everything, like the participants. A list managed for someone else; allows a co-owner. */
  SHARED = 'shared',
}
