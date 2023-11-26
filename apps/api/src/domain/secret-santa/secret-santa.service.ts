import { Injectable } from '@nestjs/common';
import { EventRepository } from '../event/event.repository';
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository';

@Injectable()
export class SecretSantaService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}
}
