import type { DrizzleTransaction } from '@wishlist/api/core'
import type { UserId } from '@wishlist/common'

import type { User } from '../model'

export interface UserRepository {
  newId(): UserId
  findById(id: UserId): Promise<User | undefined>
  findByIdOrFail(id: UserId): Promise<User>
  findByEmail(email: string): Promise<User | undefined>
  findByEmails(emails: string[]): Promise<User[]>
  findAllByCriteria(params: { criteria: string; ignoreUserId?: UserId; limit?: number }): Promise<User[]>
  findAllPaginated(params: {
    criteria?: string
    pagination: { take: number; skip: number }
  }): Promise<{ users: User[]; totalCount: number }>
  findClosestFriends(userId: UserId, limit: number): Promise<User[]>
  save(user: User, tx?: DrizzleTransaction): Promise<void>
  delete(userId: UserId): Promise<void>
}
