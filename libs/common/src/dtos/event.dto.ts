import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinDate,
  ValidateNested,
} from 'class-validator'

import { EventId, UserId } from '../ids'
import { AddEventAttendeeInputDto, AttendeeDto } from './attendee.dto'
import { GetPaginationQueryDto } from './common.dto'
import { WishlistWithOwnerDto } from './wishlist.dto'

export class MiniEventDto {
  id!: EventId
  title!: string
  description?: string
  event_date!: string
}

export class EventWithCountsDto extends MiniEventDto {
  nb_wishlists!: number
  attendees!: AttendeeDto[]
  created_at!: string
  updated_at!: string
}

export class DetailedEventDto extends MiniEventDto {
  wishlists!: WishlistWithOwnerDto[]
  attendees!: AttendeeDto[]
  created_at!: string
  updated_at!: string
}

export class GetAllEventsPaginationQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsOptional()
  user_id?: UserId
}

export class UpdateEventInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @MinDate(new Date(new Date().toDateString()))
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  event_date!: Date
}

export class CreateEventInputDto extends UpdateEventInputDto {
  @ValidateNested({ each: true })
  @Type(() => AddEventAttendeeInputDto)
  attendees?: AddEventAttendeeInputDto[]
}

export class GetEventsQueryDto extends GetPaginationQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  only_future?: boolean

  @IsInt()
  @IsPositive()
  @Max(200)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number
}
