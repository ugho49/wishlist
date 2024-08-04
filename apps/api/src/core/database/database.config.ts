import { IsString } from 'class-validator'

export class DatabaseConfig {
  @IsString()
  host: string

  @IsString()
  port: string

  @IsString()
  username: string

  @IsString()
  password: string

  @IsString()
  database: string
}
