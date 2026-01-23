import type { DrizzleTransaction } from '@wishlist/api/core'
import type { UserId, UserSocialId, UserSocialType } from '@wishlist/common'
import type { UserSocial } from '../model/user-social.model'

export interface UserSocialRepository {
  newId(): UserSocialId
  findByIds(userSocialIds: UserSocialId[]): Promise<UserSocial[]>
  findByUserId(userId: UserId): Promise<UserSocial[]>
  findByUserIds(userIds: UserId[]): Promise<UserSocial[]>
  findBySocialId(socialId: string, socialType: UserSocialType): Promise<UserSocial | undefined>
  save(userSocial: UserSocial, tx?: DrizzleTransaction): Promise<void>
  delete(id: UserSocialId, tx?: DrizzleTransaction): Promise<void>
}
