import type { UserId } from '@wishlist/common'

import type { User } from '../models'

export interface UserRepository {
  newId(): UserId
  findById(id: UserId): Promise<User | undefined>
  findByIdOrFail(id: UserId): Promise<User>
  findByEmail(email: string): Promise<User | undefined>
  findByEmails(emails: string[]): Promise<User[]>
  save(user: User): Promise<void>
}
