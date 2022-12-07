import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  AttendeeRole,
  CreateEventInputDto,
  createPagedResponse,
  DetailedEventDto,
  EventWithCountsAndCreatorDto,
  EventWithCountsDto,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
  ICurrentUser,
} from '@wishlist/common-types';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import {
  toDetailedEventDto,
  toEventWithCountsAndCreatorDto,
  toEventWithCountsDto,
  toMiniEventDto,
} from './event.mapper';
import { EventRepository } from './event.repository';
import { uniq } from 'lodash';
import { AttendeeEntity } from '../attendee/attendee.entity';
import { EventEntity } from './event.entity';
import { UserRepository } from '../user/user.repository';
import { WishlistEntity } from '../wishlist/wishlist.entity';
import { EntityManager } from 'typeorm';
import { EventMailer } from './event.mailer';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly userRepository: UserRepository,
    private readonly eventMailer: EventMailer
  ) {}

  async getAllByUserIdPaginated(pageNumber: number): Promise<PagedResponse<EventWithCountsAndCreatorDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const skip = pageSize * (pageNumber - 1);

    const [entities, totalElements] = await this.eventRepository.findAll({
      take: pageSize,
      skip,
    });

    const dtos = await Promise.all(entities.map((entity) => toEventWithCountsAndCreatorDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async getUserEventsPaginated(param: {
    limit?: number;
    onlyFuture: boolean;
    pageNumber: number;
    currentUserId: string;
  }): Promise<PagedResponse<EventWithCountsDto>> {
    const { pageNumber, currentUserId, limit, onlyFuture } = param;
    const pageSize = limit !== undefined ? limit : DEFAULT_RESULT_NUMBER;

    const skip = pageSize * (pageNumber - 1);

    const [entities, totalElements] = await this.eventRepository.findAllForUserid({
      userId: currentUserId,
      take: pageSize,
      skip,
      onlyFuture,
    });

    const dtos = await Promise.all(entities.map((entity) => toEventWithCountsDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async findById(param: { eventId: string; currentUserId: string }): Promise<DetailedEventDto> {
    const entity = await this.eventRepository.findByIdAndUserId({
      eventId: param.eventId,
      userId: param.currentUserId,
    });

    if (!entity) {
      throw new NotFoundException('Event not found');
    }

    return toDetailedEventDto(entity);
  }

  async findByIdForAdmin(eventId: string): Promise<DetailedEventDto> {
    const entity = await this.eventRepository.findOneBy({ id: eventId });

    if (!entity) {
      throw new NotFoundException('Event not found');
    }

    return toDetailedEventDto(entity);
  }

  async create(param: { currentUser: ICurrentUser; dto: CreateEventInputDto }): Promise<MiniEventDto> {
    const { currentUser, dto } = param;
    const attendees = dto.attendees.filter((a) => a.email !== currentUser.email);
    const attendeeEmails = uniq(attendees.map((a) => a.email));
    const existingUsers = await this.userRepository.findByEmails(attendeeEmails);
    const attendeeEntities: AttendeeEntity[] = [];

    const eventEntity = EventEntity.create({
      title: dto.title,
      description: dto.description,
      eventDate: dto.event_date,
      creatorId: currentUser.id,
    });

    for (const attendee of attendees) {
      const user = existingUsers.find((u) => u.email === attendee.email);
      const baseParams = { eventId: eventEntity.id, role: attendee.role || AttendeeRole.USER };
      const attendeeEntity = user
        ? AttendeeEntity.createFromExistingUser({ ...baseParams, userId: user.id })
        : AttendeeEntity.createFromNonExistingUser({ ...baseParams, email: attendee.email });

      attendeeEntities.push(attendeeEntity);
    }

    eventEntity.attendees = Promise.resolve(attendeeEntities);

    await this.eventRepository.save(eventEntity);

    const creator = await this.userRepository.findOneByOrFail({ id: currentUser.id });

    const existingAttendeeEmails = existingUsers.map((e) => e.email);
    const notExistingAttendeeEmails = attendeeEntities
      .filter((a) => a.email !== undefined && a.email !== null)
      .map((a) => a.email) as string[];

    try {
      await this.eventMailer.sendEmailForExistingAttendee({
        emails: existingAttendeeEmails,
        event: eventEntity,
        creator,
      });

      await this.eventMailer.sendEmailForNotExistingAttendee({
        emails: notExistingAttendeeEmails,
        event: eventEntity,
        creator,
      });
    } catch (e) {
      this.logger.error('Fail to send mail to event attendees', e);
    }

    return toMiniEventDto(eventEntity);
  }

  async deleteEvent(param: { eventId: string; currentUser: ICurrentUser }): Promise<void> {
    const { currentUser, eventId } = param;
    const eventEntity = await this.eventRepository.findOneBy({ id: eventId });

    if (!eventEntity) {
      throw new NotFoundException('Event not found');
    }

    const creator = await eventEntity.creator;
    const userCanDeleteEvent = creator.id === currentUser.id || currentUser.isAdmin;

    // TODO: handle role EDITOR or ADMIN
    if (!userCanDeleteEvent) {
      throw new UnauthorizedException('Only the creator of the event can delete it');
    }

    await this.eventRepository.getDataSource().transaction(async (em) => {
      const wishlists = await eventEntity.wishlists;
      for (const wishlistEntity of wishlists) {
        await this.removeEventOfWishlist(em, { wishlistEntity, eventEntity });
      }
      await em.delete(EventEntity, { id: eventId });
    });
  }

  async updateEvent(param: { eventId: string; currentUser: ICurrentUser; dto: UpdateEventInputDto }): Promise<void> {
    const { currentUser, eventId, dto } = param;

    const eventEntity = await this.eventRepository.findOneBy({ id: eventId });

    if (!eventEntity) {
      throw new NotFoundException('Event not found');
    }

    const creator = await eventEntity.creator;
    const userCanUpdateEvent = creator.id === currentUser.id || currentUser.isAdmin;

    // TODO: handle role EDITOR or ADMIN
    if (!userCanUpdateEvent) {
      throw new UnauthorizedException('Only the creator of the event can update it');
    }

    await this.eventRepository.update(
      { id: eventId },
      {
        title: dto.title,
        description: dto.description || null,
        eventDate: dto.event_date,
      }
    );
  }

  async removeEventOfWishlist(
    em: EntityManager,
    param: { wishlistEntity: WishlistEntity; eventEntity: EventEntity }
  ): Promise<void> {
    const { wishlistEntity, eventEntity } = param;
    const events = await wishlistEntity.events;
    const eventIds = events.map((e) => e.id);

    if (!eventIds.includes(eventEntity.id)) {
      return;
    }

    if (eventIds.length == 1) {
      // delete list, because a list cannot be alone
      // she must always be attached to at least one event
      await em.delete(WishlistEntity, { id: wishlistEntity.id });
      return;
    }

    const newEvents = events.filter((e) => e.id !== eventEntity.id);
    wishlistEntity.events = Promise.resolve(newEvents);

    await em.save(WishlistEntity, wishlistEntity);
  }
}
