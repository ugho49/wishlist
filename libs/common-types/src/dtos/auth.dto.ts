import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginOutputDto {
  access_token: string;
}

export class LoginInputDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @IsNotEmpty()
  password: string;
}
