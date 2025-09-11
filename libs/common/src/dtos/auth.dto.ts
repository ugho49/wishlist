import { Transform } from 'class-transformer'
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginOutputDto {
  declare access_token: string
  declare new_user_created?: boolean
  declare linked_to_existing_user?: boolean
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
  declare code: string

  @IsBoolean()
  @IsNotEmpty()
  declare createUserIfNotExists: boolean
}

export class RefreshTokenInputDto {
  @IsString()
  @IsNotEmpty()
  declare token: string
}
