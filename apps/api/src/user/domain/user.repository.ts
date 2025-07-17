import type { UserId } from '@wishlist/common'

import type { User } from './user.model'

export interface UserRepository {
  findById(id: UserId): Promise<User | undefined>
  findByIdOrFail(id: UserId): Promise<User>
  findByEmail(email: string): Promise<User | undefined>
}
