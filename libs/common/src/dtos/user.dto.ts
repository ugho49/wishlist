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
  picture_url!: string
}

export class UserSocialDto {
  id!: UserSocialId
  social_id!: string
  social_type!: string
  picture_url?: string
  created_at!: string
  updated_at!: string
}

export class MiniUserDto {
  id!: UserId
  firstname!: string
  lastname!: string
  email!: string
  picture_url?: string
}

export class UserDto extends MiniUserDto {
  birthday?: string
  admin!: boolean
  is_enabled!: boolean
  last_connected_at?: string
  last_ip?: string
  social!: UserSocialDto[]
  created_at!: string
  updated_at!: string
}

export class UserEmailSettingsDto {
  daily_new_item_notification!: boolean
}

export class UpdateUserEmailSettingsInputDto {
  @IsBoolean()
  @IsNotEmpty()
  daily_new_item_notification!: boolean
}

export class RegisterUserInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstname!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastname!: string

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password!: string
}

export class RegisterUserWithGoogleInputDto {
  @IsString()
  @IsNotEmpty()
  credential!: string
}

export class UpdateUserProfileInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstname!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastname!: string

  @MaxDate(new Date())
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birthday?: Date
}

export class ChangeUserPasswordInputDto {
  @IsString()
  @IsNotEmpty()
  old_password!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  new_password!: string
}

export class ResetPasswordInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email!: string
}

export class ResetPasswordValidationInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email!: string

  @IsString()
  @IsNotEmpty()
  token!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  new_password!: string
}

export class UpdateFullUserProfileInputDto {
  @IsEmail()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  email?: string

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @IsOptional()
  new_password?: string

  @IsString()
  @MaxLength(50)
  @IsOptional()
  firstname?: string

  @IsString()
  @MaxLength(50)
  @IsOptional()
  lastname?: string

  @MaxDate(new Date())
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birthday?: Date

  @IsBoolean()
  @IsOptional()
  is_enabled?: boolean
}

export class GetAllUsersQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsOptional()
  q?: string = ''
}
