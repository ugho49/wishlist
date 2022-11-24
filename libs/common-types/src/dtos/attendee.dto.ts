import { MiniUserDto } from './user.dto';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { AttendeeRole } from '../enums';

export class AttendeeDto {
  id: string;
  user?: MiniUserDto;
  pending_email?: string;
  role: string;
}

export class AddEventAttendeeInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsEnum(AttendeeRole)
  @IsOptional()
  role?: AttendeeRole = AttendeeRole.USER;
}

export class AddEventAttendeeForEventInputDto extends AddEventAttendeeInputDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  event_id: string;
}
