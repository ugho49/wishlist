import { MiniUserDto } from './user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendeeDto {
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
