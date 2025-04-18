import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class DatabaseConfig {
  @IsString()
  host: string

  @IsNumber()
  port: number

  @IsString()
  username: string

  @IsString()
  password: string

  @IsString()
  database: string

  @IsBoolean()
  @IsOptional()
  verbose?: boolean
}
