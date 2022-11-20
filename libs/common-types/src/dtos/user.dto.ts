import { IsDateString, IsEmail, IsNotEmpty, IsString, MaxDate, MaxLength, MinLength } from 'class-validator';

export class UserDto {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  admin: boolean;
  is_enabled: boolean;
  last_connected_at?: string;
  last_ip?: string;
  created_at: string;
  updated_at: string;
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
