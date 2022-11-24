import { MiniUserDto } from './user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendeeDto {
  id: string;
  user?: MiniUserDto;
  pending_email?: string;
  role: string; //AttendeeRole;
}

/*
TODO ->
public enum AttendeeRole {
    USER("user"),
    EDITOR("editor"),
    ADMIN("admin");
 */

export class AddEventAttendeeInputDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsOptional()
  role: string = 'user'; // TODO --> change with AttendeeRole.USER
}

export class AddEventAttendeeForEventInputDto extends AddEventAttendeeInputDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  event_id: string;
}
