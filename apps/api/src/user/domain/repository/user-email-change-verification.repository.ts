import type { DrizzleTransaction } from '@wishlist/api/core'
import type { UserEmailChangeVerificationId, UserId } from '@wishlist/common'
import type { UserEmailChangeVerification } from '../model/user-email-change-verification.model'

export interface UserEmailChangeVerificationRepository {
  newId(): UserEmailChangeVerificationId
  findByUserId(userId: UserId): Promise<UserEmailChangeVerification[]>
  findByTokenAndEmail(token: string, email: string): Promise<UserEmailChangeVerification | undefined>
  save(userEmailChangeVerification: UserEmailChangeVerification, tx?: DrizzleTransaction): Promise<void>
  delete(id: UserEmailChangeVerificationId, tx?: DrizzleTransaction): Promise<void>
}
