import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsString, MaxDate, MaxLength, MinLength } from 'class-validator';

export class MiniUserDto {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export class UserDto extends MiniUserDto {
  birthday?: string;
  admin: boolean;
  is_enabled: boolean;
  last_connected_at?: string;
  last_ip?: string;
  created_at: string;
  updated_at: string;
}

export class UserEmailSettingsDto {
  daily_new_item_notification: boolean;
}

export class UpdateUserEmailSettingsInputDto {
  @IsBoolean()
  @IsNotEmpty()
  daily_new_item_notification: boolean;
}

export class RegisterUserInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastname: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}

export class UpdateUserProfileInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastname: string;

  @MaxDate(new Date())
  @IsDateString()
  birthday: string;
}

export class ChangeUserPasswordInputDto {
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}

export class ResetPasswordInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordValidationInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}
