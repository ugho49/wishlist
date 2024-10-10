import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { SecretSantaDrawService } from '@wishlist/common'
import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUsersInputDto,
  CreateSecretSantaUsersOutputDto,
  SecretSantaDto,
  SecretSantaStatus,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types'
import { ArrayContains, In } from 'typeorm'

import { toAttendeeDto } from '../attendee/attendee.mapper'
import { EventRepository } from '../event/event.repository'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'
import { SecretSantaMailer } from './secret-santa.mailer'
import { toSecretSantaDto, toSecretSantaUserDto, toSecretSantaUserWithDrawDto } from './secret-santa.mapper'
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository'

@Injectable()
export class SecretSantaService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
    private readonly mailer: SecretSantaMailer,
  ) {}

  async getForEvent(param: { eventId: string; currentUserId: string }): Promise<SecretSantaDto | null> {
    return this.secretSantaRepository
      .getSecretSantaForEventAndUser({
        eventId: param.eventId,
        userId: param.currentUserId,
      })
      .then(entity => (entity ? toSecretSantaDto(entity) : null))
  }

  async getMyDrawForEvent(param: { eventId: string; currentUserId: string }): Promise<AttendeeDto | null> {
    return this.secretSantaUserRepository
      .getDrawSecretSantaUserForEvent({
        eventId: param.eventId,
        userId: param.currentUserId,
      })
      .then(entity => (entity ? entity.attendee : null))
      .then(entity => (entity ? toAttendeeDto(entity) : null))
  }

  async createForEvent(param: { currentUserId: string; dto: CreateSecretSantaInputDto }): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.exists({ where: { eventId: param.dto.event_id } })

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event')
    }

    const event = await this.eventRepository.findByIdAndUserId({
      eventId: param.dto.event_id,
      userId: param.currentUserId,
    })

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    const entity = SecretSantaEntity.create({
      eventId: event.id,
      budget: param.dto.budget,
      description: param.dto.description,
    })

    await this.secretSantaRepository.save(entity)

    return toSecretSantaDto(entity)
  }

  async updateSecretSanta(param: {
    currentUserId: string
    secretSantaId: string
    dto: UpdateSecretSantaInputDto
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    await this.secretSantaRepository.update(
      { id: secretSanta.id },
      {
        description: param.dto.description ?? null,
        budget: param.dto.budget ?? null,
      },
    )
  }

  async deleteSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    await this.secretSantaRepository.delete({ id: secretSanta.id })
  }

  async startSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    const event = await secretSanta.event

    if (event.eventDate < new Date()) {
      throw new BadRequestException('Event is already finished')
    }

    let secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })

    try {
      const drawService = new SecretSantaDrawService(
        secretSantaUsers.map(ss => ({ id: ss.id, exclusions: ss.exclusions })),
      )
      const assignedUsers = drawService.assignSecretSantas()

      await this.secretSantaRepository.transaction(async em => {
        for (const user of assignedUsers) {
          await em.update(SecretSantaUserEntity, { id: user.userId }, { drawUserId: user.drawUserId })
        }

        await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.STARTED })
      })
    } catch {
      throw new UnprocessableEntityException('Failed to draw secret santa, please try again')
    }

    secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id })
    const secretSantaDto = await Promise.all(secretSantaUsers.map(ss => toSecretSantaUserWithDrawDto(ss)))

    await this.mailer.sendDrawnEmails({
      eventTitle: event.title,
      eventId: event.id,
      budget: secretSanta.budget ?? undefined,
      description: secretSanta.description ?? undefined,
      drawns: secretSantaDto.map(ss => ({
        email: ss.attendee.pending_email ?? ss.attendee.user?.email ?? '',
        secretSantaName: ss.draw?.pending_email ?? `${ss.draw?.user?.firstname} ${ss.draw?.user?.lastname}`,
      })),
    })
  }

  async cancelSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    if (secretSanta.status === SecretSantaStatus.CREATED) {
      throw new BadRequestException('Secret santa not yet started')
    }

    await this.secretSantaRepository.transaction(async em => {
      await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.CREATED })
      await em.update(SecretSantaUserEntity, { secretSantaId: secretSanta.id }, { drawUserId: null })
    })

    const event = await secretSanta.event
    const users = await secretSanta.users
    const attendees = await Promise.all(users.map(u => u.attendee.then(toAttendeeDto)))

    await this.mailer.sendCancelSecretSantaEmails({
      eventTitle: event.title,
      eventId: event.id,
      attendeeEmails: attendees.map(a => a.pending_email ?? a.user?.email ?? ''),
    })
  }

  async addSecretSantaUsers(param: {
    currentUserId: string
    secretSantaId: string
    dto: CreateSecretSantaUsersInputDto
  }): Promise<CreateSecretSantaUsersOutputDto> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    const alreadyExists = await this.secretSantaUserRepository.attendeesExistsForSecretSanta({
      secretSantaId: secretSanta.id,
      attendeeIds: param.dto.attendee_ids,
    })

    if (alreadyExists) {
      throw new BadRequestException('One attendee is already in the secret santa')
    }

    const eventAttendees = await secretSanta.event.then(event => event.attendees)

    for (const attendeeId of param.dto.attendee_ids) {
      if (!eventAttendees.some(a => a.id === attendeeId)) {
        throw new BadRequestException(`Attendee ${attendeeId} not found for event`)
      }
    }

    const entities = param.dto.attendee_ids.map(attendeeId =>
      SecretSantaUserEntity.create({
        secretSantaId: secretSanta.id,
        attendeeId,
      }),
    )

    await this.secretSantaUserRepository.save(entities)

    const users = await Promise.all(entities.map(entity => toSecretSantaUserDto(entity)))

    return { users }
  }

  async updateSecretSantaUser(param: {
    currentUserId: string
    secretSantaId: string
    secretSantaUserId: string
    dto: UpdateSecretSantaUserInputDto
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    const secretSantaUsers =
      param.dto.exclusions.length === 0
        ? []
        : await this.secretSantaUserRepository.findBy({
            id: In(param.dto.exclusions),
            secretSantaId: param.secretSantaId,
          })

    const exclusionsIds = secretSantaUsers.map(u => u.id)

    if (exclusionsIds.includes(param.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself')
    }

    await this.secretSantaUserRepository.update(
      { id: param.secretSantaUserId },
      {
        exclusions: exclusionsIds,
      },
    )
  }

  async deleteSecretSantaUser(param: {
    currentUserId: string
    secretSantaId: string
    secretSantaUserId: string
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    })

    this.checkSecretSantaNotStarted(secretSanta)

    await this.secretSantaUserRepository.transaction(async em => {
      await em.delete(SecretSantaUserEntity, { id: param.secretSantaUserId })
      await em.update(
        SecretSantaUserEntity,
        { exclusions: ArrayContains([param.secretSantaUserId]) },
        { exclusions: () => `array_remove(exclusions, '${param.secretSantaUserId}')` },
      )
    })
  }

  private checkSecretSantaNotStarted(secretSanta: SecretSantaEntity) {
    if (secretSanta.status === SecretSantaStatus.STARTED) {
      throw new ForbiddenException('Secret santa already started')
    }
  }
}
