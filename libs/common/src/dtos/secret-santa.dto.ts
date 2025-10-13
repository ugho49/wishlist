import type { SecretSantaStatus } from '../enums'
import type { AttendeeId, EventId, SecretSantaId, SecretSantaUserId } from '../ids'
import type { AttendeeDto, MiniEventDto } from '.'

import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { uniq } from 'lodash'

export class SecretSantaUserDto {
  declare id: SecretSantaUserId
  declare attendee: AttendeeDto
  declare exclusions: SecretSantaUserId[]
}

export class SecretSantaUserWithDrawDto extends SecretSantaUserDto {
  declare draw?: AttendeeDto
}

export class SecretSantaDto {
  declare id: SecretSantaId
  declare event: MiniEventDto
  declare description?: string
  declare budget?: number
  declare status: SecretSantaStatus
  declare users: SecretSantaUserDto[]
  declare created_at: string
  declare updated_at: string
}

export class UpdateSecretSantaInputDto {
  @IsString()
  @IsOptional()
  declare description?: string

  @IsNumber()
  @IsPositive()
  @IsOptional()
  declare budget?: number
}

export class CreateSecretSantaInputDto extends UpdateSecretSantaInputDto {
  @IsString()
  declare event_id: EventId
}

export class CreateSecretSantaUsersInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  declare attendee_ids: AttendeeId[]
}

export class UpdateSecretSantaUserInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  declare exclusions: SecretSantaUserId[]
}

export class CreateSecretSantaUsersOutputDto {
  declare users: SecretSantaUserDto[]
}
