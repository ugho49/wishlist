import { IsNumber, IsString } from 'class-validator'

export class MailConfig {
  @IsString()
  from: string

  @IsString()
  host: string

  @IsNumber()
  port: number

  @IsString()
  username: string

  @IsString()
  password: string

  @IsString()
  templateDir: string
}
