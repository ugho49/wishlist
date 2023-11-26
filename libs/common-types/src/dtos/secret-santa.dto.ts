import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { SecretSantaStatus } from '../enums';
import { AttendeeDto, MiniEventDto } from '../dtos';
import { Transform } from 'class-transformer';
import { uniq } from 'lodash';

export class SecretSantaUserDto {
  id: string;
  attendee: AttendeeDto;
  exclusions: string[];
}

export class SecretSantaDto {
  id: string;
  event: MiniEventDto;
  description?: string;
  budget?: number;
  status: SecretSantaStatus;
  users: SecretSantaUserDto[];
  created_at: string;
  updated_at: string;
}

export class UpdateSecretSantaInputDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: number;
}

export class CreateSecretSantaInputDto extends UpdateSecretSantaInputDto {
  @IsString()
  event_id: string;
}

export class CreateSecretSantaUserInputDto {
  @IsString()
  attendee_id: string;
}

export class UpdateSecretSantaUserInputDto {
  @IsString({ each: true })
  @Transform(({ value }) => uniq(value))
  exclusions: string[];
}
