import type { UserSocialType } from '../enums/user-social.enum';
import type { UserId, UserSocialId } from '../ids';

export type UpdateUserPictureHttpResponse = {
  picture_url: string;
};

export class UserSocialDto {
  declare id: UserSocialId;
  declare email: string;
  declare name?: string;
  declare social_id: string;
  declare social_type: UserSocialType;
  declare picture_url?: string;
  declare created_at: string;
  declare updated_at: string;
}

export class MiniUserDto {
  declare id: UserId;
  declare firstname: string;
  declare lastname: string;
  declare email: string;
  declare picture_url?: string;
}

export class UserEmailSettingsDto {
  declare daily_new_item_notification: boolean;
}
