import { IsBoolean, IsNumber, IsString } from 'class-validator'

export class DatabaseConfig {
  @IsString()
  host!: string

  @IsNumber()
  port!: number

  @IsString()
  username!: string

  @IsString()
  password!: string

  @IsString()
  database!: string

  @IsBoolean()
  runMigrations!: boolean

  @IsString()
  migrationsFolder!: string

  @IsBoolean()
  verbose!: boolean
}
