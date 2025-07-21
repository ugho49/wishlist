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
  declare id: EventId
  declare title: string
  declare description?: string
  declare event_date: string
}

export class EventWithCountsDto extends MiniEventDto {
  declare nb_wishlists: number
  declare attendees: AttendeeDto[]
  declare created_at: string
  declare updated_at: string
}

export class DetailedEventDto extends MiniEventDto {
  declare wishlists: WishlistWithOwnerDto[]
  declare attendees: AttendeeDto[]
  declare created_at: string
  declare updated_at: string
}

export class GetAllEventsPaginationQueryDto extends GetPaginationQueryDto {
  @IsString()
  @IsOptional()
  declare user_id?: UserId
}

export class UpdateEventInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare title: string

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  declare description?: string

  @MinDate(new Date(new Date().toDateString()), { message: 'event_date must not be earlier than today' })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  declare event_date: Date
}

export class CreateEventInputDto extends UpdateEventInputDto {
  @ValidateNested({ each: true })
  @Type(() => AddEventAttendeeInputDto)
  declare attendees?: AddEventAttendeeInputDto[]
}

export class GetEventsQueryDto extends GetPaginationQueryDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  declare only_future?: boolean

  @IsInt()
  @IsPositive()
  @Max(200)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  declare limit?: number
}
