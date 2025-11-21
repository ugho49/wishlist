import type { UserSocialType } from '../enums'
import type { UserId, UserSocialId } from '../ids'

import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator'

import { GetPaginationQueryDto } from './common.dto'

export class UpdateUserPictureOutputDto {
  declare picture_url: string
}

export class UserSocialDto {
  declare id: UserSocialId
  declare email: string
  declare name?: string
  declare social_id: string
  declare social_type: UserSocialType
  declare picture_url?: string
  declare created_at: string
  declare updated_at: string
}

export class MiniUserDto {
  declare id: UserId
  declare firstname: string
  declare lastname: string
  declare email: string
  declare picture_url?: string
}

export class UserWithoutSocialsDto extends MiniUserDto {
  declare birthday?: string
  declare admin: boolean
  declare is_enabled: boolean
  declare last_connected_at?: string
  declare last_ip?: string
  declare created_at: string
  declare updated_at: string
}

export class UserDto extends UserWithoutSocialsDto {
  declare social: UserSocialDto[]
}

export class UserEmailSettingsDto {
  declare daily_new_item_notification: boolean
}

export class UpdateUserEmailSettingsInputDto {
  @IsBoolean()
  @IsNotEmpty()
  declare daily_new_item_notification: boolean
}

export class PendingEmailChangeDto {
  declare new_email: string
  declare expired_at: string
}

export class RegisterUserInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  declare firstname: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  declare lastname: string

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  declare email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  declare password: string
}

export class LinkUserToGoogleInputDto {
  @IsString()
  @IsNotEmpty()
  declare code: string
}

export class UpdateUserProfileInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  declare firstname: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  declare lastname: string

  @MaxDate(new Date())
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  declare birthday?: Date
}

export class ChangeUserPasswordInputDto {
  @IsString()
  @IsNotEmpty()
  declare old_password: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  declare new_password: string
}

export class ResetPasswordInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  declare email: string
}

export class ResetPasswordValidationInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  declare email: string

  @IsString()
  @IsNotEmpty()
  declare token: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  declare new_password: string
}

export class RequestEmailChangeInputDto {
  @IsEmail()
  @MaxLength(200)
  @IsString()
  @IsNotEmpty()
  declare new_email: string
}

export class ConfirmEmailChangeInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  declare new_email: string

  @IsString()
  @IsNotEmpty()
  declare token: string
}

export class UpdateFullUserProfileInputDto {
  @IsEmail()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  declare email?: string

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  declare new_password?: string

  @IsString()
  @MaxLength(50)
  @IsOptional()
  declare firstname?: string

  @IsString()
  @MaxLength(50)
  @IsOptional()
  declare lastname?: string

  @MaxDate(new Date())
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  declare birthday?: Date

  @IsBoolean()
  @IsOptional()
  declare is_enabled?: boolean
}

export class GetAllUsersQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsOptional()
  declare q?: string
}
