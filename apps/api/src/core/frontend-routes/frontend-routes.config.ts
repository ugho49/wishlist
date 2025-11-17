import { IsString } from 'class-validator'

export class FrontendRoutesConfig {
  @IsString()
  baseUrl!: string
}
