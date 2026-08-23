import type { UserId, UserSocialId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserSocial } from '../model/user-social.model';
import type { UserSocialType } from '../user-social-type.enum';

export interface UserSocialRepository {
  newId(): UserSocialId;
  findByIds(userSocialIds: UserSocialId[]): Promise<UserSocial[]>;
  findByUserId(userId: UserId): Promise<UserSocial[]>;
  findByUserIds(userIds: UserId[]): Promise<UserSocial[]>;
  findBySocialId(socialId: string, socialType: UserSocialType): Promise<UserSocial | undefined>;
  save(userSocial: UserSocial, tx?: DrizzleTransaction): Promise<void>;
  delete(id: UserSocialId, tx?: DrizzleTransaction): Promise<void>;
}
