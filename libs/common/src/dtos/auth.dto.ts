import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginOutputDto {
  declare access_token: string
  declare refresh_token: string
}

export class RefreshTokenOutputDto {
  declare access_token: string
}

export class LoginInputDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  declare email: string

  @IsNotEmpty()
  declare password: string
}

export class LoginWithGoogleInputDto {
  @IsString()
  @IsNotEmpty()
  declare credential: string
}

export class RefreshTokenInputDto {
  @IsString()
  @IsNotEmpty()
  declare token: string
}
