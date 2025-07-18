import type { UserSocialId, UserSocialType } from '@wishlist/common'

import type { UserSocial } from '../models'

export interface UserSocialRepository {
  newId(): UserSocialId
  findBySocialId(socialId: string, socialType: UserSocialType): Promise<UserSocial | undefined>
  save(userSocial: UserSocial): Promise<void>
}
