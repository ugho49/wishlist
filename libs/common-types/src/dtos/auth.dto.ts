import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginOutputDto {
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
