import type { AttendeeId, ICurrentUser, SecretSantaId, SecretSantaUserDto } from '@wishlist/common'

import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { SecretSantaRepository, SecretSantaUser, SecretSantaUserRepository } from '../../domain'
import { secretSantaMapper } from '../../infrastructure'

export type AddSecretSantaUsersInput = {
  currentUser: ICurrentUser
  secretSantaId: SecretSantaId
  attendeeIds: AttendeeId[]
}

export type AddSecretSantaUsersResult = {
  users: SecretSantaUserDto[]
}

@Injectable()
export class AddSecretSantaUsersUseCase {
  private readonly logger = new Logger(AddSecretSantaUsersUseCase.name)

  constructor(
    @Inject(REPOSITORIES.SECRET_SANTA) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(REPOSITORIES.SECRET_SANTA_USER) private readonly secretSantaUserRepository: SecretSantaUserRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: AddSecretSantaUsersInput): Promise<AddSecretSantaUsersResult> {
    this.logger.log('Add secret santa users request received', { command })
    const secretSanta = await this.secretSantaRepository.findByIdOrFail(command.secretSantaId)
    const event = await this.eventRepository.findByIdOrFail(secretSanta.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new ForbiddenException('Event cannot be edited by this user')
    }

    if (!secretSanta.canBeModified()) {
      throw new ForbiddenException('Secret santa already started')
    }

    if (!secretSanta.canAddUsers(command.attendeeIds)) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    for (const attendeeId of command.attendeeIds) {
      if (!event.attendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const users = command.attendeeIds.map(attendeeId =>
      SecretSantaUser.create({
        id: this.secretSantaUserRepository.newId(),
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    this.logger.log('Creating secret santa users...', { secretSantaId: secretSanta.id, users })
    await this.secretSantaUserRepository.saveAll(users)

    const userDtos = users.map(user =>
      secretSantaMapper.toSecretSantaUserDto(user, event.attendees.find(a => a.id === user.attendeeId)!),
    )

    return { users: userDtos }
  }
}
