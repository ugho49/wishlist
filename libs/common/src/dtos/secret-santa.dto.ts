import type { SecretSantaStatus } from '../enums/secret-santa.enum';
import type { SecretSantaId, SecretSantaUserId } from '../ids';
import type { AttendeeDto } from './attendee.dto';
import type { MiniEventDto } from './event.dto';

export class SecretSantaUserDto {
  declare id: SecretSantaUserId;
  declare attendee: AttendeeDto;
  declare exclusions: SecretSantaUserId[];
}

export class SecretSantaDto {
  declare id: SecretSantaId;
  declare event: MiniEventDto;
  declare description?: string;
  declare budget?: number;
  declare status: SecretSantaStatus;
  declare users: SecretSantaUserDto[];
  declare created_at: string;
  declare updated_at: string;
}
