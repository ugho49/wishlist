import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { uniq } from 'lodash'

import { AttendeeDto, MiniEventDto } from '../dtos'
import { SecretSantaStatus } from '../enums'

export class SecretSantaUserDto {
  id: string
  attendee: AttendeeDto
  exclusions: string[]
}

export class SecretSantaUserWithDrawDto extends SecretSantaUserDto {
  draw?: AttendeeDto
}

export class SecretSantaDto {
  id: string
  event: MiniEventDto
  description?: string
  budget?: number
  status: SecretSantaStatus
  users: SecretSantaUserDto[]
  created_at: string
  updated_at: string
}

export class UpdateSecretSantaInputDto {
  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: number
}

export class CreateSecretSantaInputDto extends UpdateSecretSantaInputDto {
  @IsString()
  event_id: string
}

export class CreateSecretSantaUsersInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  attendee_ids: string[]
}

export class UpdateSecretSantaUserInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  exclusions: string[]
}

export class CreateSecretSantaUsersOutputDto {
  users: SecretSantaUserDto[]
}
