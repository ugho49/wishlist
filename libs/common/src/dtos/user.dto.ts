import type { UserId } from '../ids';

export type UpdateUserPictureHttpResponse = {
  picture_url: string;
};

export class MiniUserDto {
  declare id: UserId;
  declare firstname: string;
  declare lastname: string;
  declare email: string;
  declare picture_url?: string;
}
