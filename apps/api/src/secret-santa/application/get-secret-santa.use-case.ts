import type { GetSecretSantaResult } from '../domain/query/get-secret-santa.query'

import { ForbiddenException, Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { AttendeeRepository } from '../../attendee/domain/attendee.repository'
import { Event } from '../../event/domain/event.model'
import { EventRepository } from '../../event/domain/event.repository'
import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, SECRET_SANTA_REPOSITORY } from '../../repositories'
import { GetSecretSantaQuery } from '../domain/query/get-secret-santa.query'
import { SecretSantaRepository } from '../domain/repository/secret-santa.repository'
import { secretSantaMapper } from '../infrastructure/secret-santa.mapper'

@QueryHandler(GetSecretSantaQuery)
export class GetSecretSantaUseCase implements IInferredQueryHandler<GetSecretSantaQuery> {
  constructor(
    @Inject(SECRET_SANTA_REPOSITORY) private readonly secretSantaRepository: SecretSantaRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(query: GetSecretSantaQuery): Promise<GetSecretSantaResult> {
    const secretSanta = await this.secretSantaRepository.findForEvent({
      eventId: query.eventId,
    })

    if (!secretSanta) return undefined

    const attendees = await this.attendeeRepository.findByEventId(query.eventId)

    if (!Event.canView({ currentUser: query.currentUser, attendees })) {
      throw new ForbiddenException('Event cannot be viewed by this user')
    }

    const event = await this.eventRepository.findByIdOrFail(query.eventId)

    return secretSantaMapper.toSecretSantaDto(secretSanta, event, attendees)
  }
}
