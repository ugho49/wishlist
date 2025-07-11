import type { AttendeeId, EventId, SecretSantaId, SecretSantaUserId } from '../ids'

import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { uniq } from 'lodash'

import { AttendeeDto, MiniEventDto } from '.'
import { SecretSantaStatus } from '../enums'

export class SecretSantaUserDto {
  id!: SecretSantaUserId
  attendee!: AttendeeDto
  exclusions!: SecretSantaUserId[]
}

export class SecretSantaUserWithDrawDto extends SecretSantaUserDto {
  draw?: AttendeeDto
}

export class SecretSantaDto {
  id!: SecretSantaId
  event!: MiniEventDto
  description?: string
  budget?: number
  status!: SecretSantaStatus
  users!: SecretSantaUserDto[]
  created_at!: string
  updated_at!: string
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
  event_id!: EventId
}

export class CreateSecretSantaUsersInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  attendee_ids!: AttendeeId[]
}

export class UpdateSecretSantaUserInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  exclusions!: SecretSantaUserId[]
}

export class CreateSecretSantaUsersOutputDto {
  users!: SecretSantaUserDto[]
}
