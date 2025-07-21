import type { AttendeeId, EventId } from '../ids'

import { Transform } from 'class-transformer'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

import { AttendeeRole } from '../enums'
import { MiniUserDto } from './user.dto'

export class AttendeeDto {
  id!: AttendeeId
  user?: MiniUserDto
  pending_email?: string
  role!: AttendeeRole
}

export class AddEventAttendeeInputDto {
  @Transform(({ value }) => value.toLowerCase())
  @MaxLength(200)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string

  @IsEnum(AttendeeRole)
  @IsOptional()
  role?: AttendeeRole
}

/**
 * @deprecated
 */
// TODO: remove this once old route have been removed
export class AddEventAttendeeForEventInputDto extends AddEventAttendeeInputDto {
  @IsString()
  @IsNotEmpty()
  event_id!: EventId
}
