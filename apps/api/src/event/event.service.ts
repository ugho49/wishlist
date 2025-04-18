import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common'
import {
  AttendeeRole,
  CreateEventInputDto,
  createPagedResponse,
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  ICurrentUser,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
  UserId,
} from '@wishlist/common-types'
import { uniq } from 'lodash'
import { EntityManager } from 'typeorm'

import { AttendeeEntity } from '../attendee/attendee.entity'
import { UserRepository } from '../user/user.repository'
import { WishlistEntity } from '../wishlist/wishlist.entity'
import { EventEntity } from './event.entity'
import { EventMailer } from './event.mailer'
import { toDetailedEventDto, toEventWithCountsDto, toMiniEventDto } from './event.mapper'
import { EventRepository } from './event.repository'

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name)

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly userRepository: UserRepository,
    private readonly eventMailer: EventMailer,
  ) {}

  async getAllPaginated(params: { pageNumber: number; userId?: UserId }): Promise<PagedResponse<EventWithCountsDto>> {
    const { pageNumber, userId } = params
    const pageSize = DEFAULT_RESULT_NUMBER
    const skip = pageSize * (pageNumber - 1)

    const [entities, totalElements] = await this.eventRepository.findAll({
      userId,
      take: pageSize,
      skip,
    })

    const dtos = await Promise.all(entities.map(entity => toEventWithCountsDto(entity)))

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    })
  }

  async getUserEventsPaginated(param: {
    limit?: number
    onlyFuture: boolean
    pageNumber: number
    currentUserId: UserId
  }): Promise<PagedResponse<EventWithCountsDto>> {
    const { pageNumber, currentUserId, limit, onlyFuture } = param
    const pageSize = limit !== undefined ? limit : DEFAULT_RESULT_NUMBER

    const skip = pageSize * (pageNumber - 1)

    const [entities, totalElements] = await this.eventRepository.findAllForUserid({
      userId: currentUserId,
      take: pageSize,
      skip,
      onlyFuture,
    })

    const dtos = await Promise.all(entities.map(entity => toEventWithCountsDto(entity)))

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    })
  }

  async findById(param: { eventId: EventId; currentUserId: UserId }): Promise<DetailedEventDto> {
    const entity = await this.eventRepository.findByIdAndUserId({
      eventId: param.eventId,
      userId: param.currentUserId,
    })

    if (!entity) {
      throw new NotFoundException('Event not found')
    }

    return toDetailedEventDto(entity)
  }

  async findByIdForAdmin(eventId: EventId): Promise<DetailedEventDto> {
    const entity = await this.eventRepository.findOneBy({ id: eventId })

    if (!entity) {
      throw new NotFoundException('Event not found')
    }

    return toDetailedEventDto(entity)
  }

  async create(param: { currentUser: ICurrentUser; dto: CreateEventInputDto }): Promise<MiniEventDto> {
    const { currentUser, dto } = param
    const attendees = dto.attendees ?? []
    const attendeeEmails = uniq(attendees.map(a => a.email))
    const existingUsers = await this.userRepository.findByEmails(attendeeEmails)
    const attendeeEntities: AttendeeEntity[] = []

    const eventEntity = EventEntity.create({
      title: dto.title,
      description: dto.description,
      eventDate: dto.event_date,
    })

    attendeeEntities.push(
      AttendeeEntity.createFromExistingUser({
        eventId: eventEntity.id,
        userId: currentUser.id,
        role: AttendeeRole.MAINTAINER,
      }),
    )

    for (const attendee of attendees) {
      const user = existingUsers.find(u => u.email === attendee.email)
      const baseParams = { eventId: eventEntity.id, role: attendee.role ?? AttendeeRole.USER }
      const attendeeEntity = user
        ? AttendeeEntity.createFromExistingUser({ ...baseParams, userId: user.id })
        : AttendeeEntity.createFromNonExistingUser({ ...baseParams, email: attendee.email })

      attendeeEntities.push(attendeeEntity)
    }

    eventEntity.attendees = Promise.resolve(attendeeEntities)

    await this.eventRepository.save(eventEntity)

    const creator = await this.userRepository.findOneByOrFail({ id: currentUser.id })

    const existingAttendeeEmails = existingUsers.map(e => e.email)
    const notExistingAttendeeEmails = attendeeEntities
      .filter(a => a.email !== undefined && a.email !== null)
      .map(a => a.email) as string[]

    try {
      await this.eventMailer.sendEmailForExistingAttendee({
        emails: existingAttendeeEmails,
        event: eventEntity,
        invitedBy: creator,
      })

      await this.eventMailer.sendEmailForNotExistingAttendee({
        emails: notExistingAttendeeEmails,
        event: eventEntity,
        invitedBy: creator,
      })
    } catch (e) {
      this.logger.error('Fail to send mail to event attendees', e)
    }

    return toMiniEventDto(eventEntity)
  }

  async updateEvent(param: { eventId: EventId; currentUser: ICurrentUser; dto: UpdateEventInputDto }): Promise<void> {
    const { currentUser, eventId, dto } = param

    const eventEntity = await this.eventRepository.findOneBy({ id: eventId })

    if (!eventEntity) {
      throw new NotFoundException('Event not found')
    }

    const canEdit = await eventEntity.canEdit(currentUser)

    if (!canEdit) {
      throw new UnauthorizedException('Only maintainers of the event can update it')
    }

    await this.eventRepository.update(
      { id: eventId },
      {
        title: dto.title,
        description: dto.description || null,
        eventDate: dto.event_date,
      },
    )
  }

  async deleteEvent(param: { eventId: EventId; currentUser: ICurrentUser }): Promise<void> {
    const { currentUser, eventId } = param
    const eventEntity = await this.eventRepository.findOneBy({ id: eventId })

    if (!eventEntity) {
      throw new NotFoundException('Event not found')
    }

    const canEdit = await eventEntity.canEdit(currentUser)

    if (!canEdit) {
      throw new UnauthorizedException('Only maintainers of the event can delete it')
    }

    await this.eventRepository.getDataSource().transaction(async em => {
      const wishlists = await eventEntity.wishlists
      for (const wishlistEntity of wishlists) {
        await this.removeEventOfWishlist(em, { wishlistEntity, eventEntity })
      }
      await em.delete(EventEntity, { id: eventId })
    })
  }

  private async removeEventOfWishlist(
    em: EntityManager,
    param: { wishlistEntity: WishlistEntity; eventEntity: EventEntity },
  ): Promise<void> {
    const { wishlistEntity, eventEntity } = param
    const events = await wishlistEntity.events
    const eventIds = events.map(e => e.id)

    if (!eventIds.includes(eventEntity.id)) {
      return
    }

    if (eventIds.length == 1) {
      // delete list, because a list cannot be alone
      // she must always be attached to at least one event
      await em.delete(WishlistEntity, { id: wishlistEntity.id })
      return
    }

    const newEvents = events.filter(e => e.id !== eventEntity.id)
    wishlistEntity.events = Promise.resolve(newEvents)

    await em.save(WishlistEntity, wishlistEntity)
  }
}
