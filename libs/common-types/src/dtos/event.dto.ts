import { MiniUserDto } from './user.dto';
import { WishlistWithOwnerDto } from './wishlist.dto';
import { AddEventAttendeeInputDto, AttendeeDto } from './attendee.dto';
import {
  ArrayNotEmpty,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MiniEventDto {
  id: string;
  title: string;
  description?: string;
  event_date: string;
}

export class EventWithCountsDto {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  nb_wishlists: number;
  nb_attendees: number;
  created_at: string;
  updated_at: string;
}

export class EventWithCountsAndCreatorDto extends EventWithCountsDto {
  created_by: MiniUserDto;
}

export class DetailedEventDto extends MiniEventDto {
  created_by: MiniUserDto;
  wishlists: WishlistWithOwnerDto[];
  attendees: AttendeeDto[];
  created_at: string;
  updated_at: string;
}

export class UpdateEventInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @MinDate(new Date(new Date().toDateString()))
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  event_date: Date;
}

export class CreateEventInputDto extends UpdateEventInputDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddEventAttendeeInputDto)
  attendees: AddEventAttendeeInputDto[];
}
