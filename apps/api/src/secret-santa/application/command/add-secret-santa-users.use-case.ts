import type { AttendeeId, ICurrentUser, SecretSantaId } from '@wishlist/common';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Injectable } from '@znight/core';
import { BadRequestException, ForbiddenException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { SecretSantaUser } from '../../domain/model/secret-santa-user.model';

export type AddSecretSantaUsersInput = {
  currentUser: ICurrentUser;
  secretSantaId: SecretSantaId;
  attendeeIds: AttendeeId[];
};

export type AddSecretSantaUsersResult = {
  users: SecretSantaUser[];
};

@Injectable()
export class AddSecretSantaUsersUseCase {
  private readonly logger = getLogger(AddSecretSantaUsersUseCase.name);

  constructor(
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: AddSecretSantaUsersInput): Promise<AddSecretSantaUsersResult> {
    this.logger.info('Add secret santa users request received', { command });
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId);
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId);

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user');
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started');
    }

    if (!secretSanta.canAddUsers(command.attendeeIds)) {
      throw new BadRequestException('One attendee is already in the secret santa');
    }

    for (const attendeeId of command.attendeeIds) {
      if (!event.attendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`);
      }
    }

    const users = command.attendeeIds.map(attendeeId =>
      SecretSantaUser.create({
        id: this.secretSantaUserRepository.newId(),
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    );

    this.logger.info('Creating secret santa users...', { secretSantaId: secretSanta.id, users });
    await this.secretSantaUserRepository.saveAll(users);

    return { users };
  }
}
