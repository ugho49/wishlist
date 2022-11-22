import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginOutputDto {
  access_token: string;
  refresh_token: string;
}

export class RefreshTokenOutputDto {
  access_token: string;
}

export class LoginInputDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RefreshTokenInputDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
