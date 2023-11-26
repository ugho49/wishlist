import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { SecretSantaStatus } from '../enums';
import { MiniEventDto } from '../dtos';

export class SecretSantaUserDto {
  id: string;
  name: string;
  email: string;
  exclusions: SecretSantaUserDto[];
}

export class SecretSantaDto {
  id: string;
  event: MiniEventDto;
  description?: string;
  budget?: number;
  status: SecretSantaStatus;
  users: SecretSantaUserDto[];
}

export class UpdateSecretSantaInputDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  budget?: boolean;
}

export class CreateSecretSantaInputDto extends UpdateSecretSantaInputDto {
  @IsString()
  eventId: string;
}

export class CreateSecretSantaUserInputDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class UpdateSecretSantaUserInputDto extends CreateSecretSantaUserInputDto {
  @IsString({ each: true })
  exclusions: string[];
}
