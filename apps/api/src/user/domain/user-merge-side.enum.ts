/**
 * During a user merge, which user a kept value comes from: the merged user (SOURCE, deleted at the end)
 * or the kept user (TARGET).
 */
export enum UserMergeSide {
  SOURCE = 'source',
  TARGET = 'target',
}
