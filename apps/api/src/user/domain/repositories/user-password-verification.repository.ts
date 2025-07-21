import type { UserId, UserPasswordVerificationId } from '@wishlist/common'

import type { UserPasswordVerification } from '../models'

export interface UserPasswordVerificationRepository {
  newId(): UserPasswordVerificationId
  findByUserId(userId: UserId): Promise<UserPasswordVerification[]>
  save(userPasswordVerification: UserPasswordVerification): Promise<void>
}
