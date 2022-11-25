import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
} from '@wishlist/common-types';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import {
  toDetailedEventDto,
  toEventWithCountsAndCreatorDto,
  toEventWithCountsDto,
  toMiniEventDto,
} from './event.mapper';
import { EventRepository } from './event.repository';
import { ICurrentUser } from '../auth';
import { uniq } from 'lodash';
import { AttendeeEntity } from '../attendee/attendee.entity';
import { EventEntity } from './event.entity';
import { UserRepository } from '../user/user.repository';
import { WishlistEntity } from '../wishlist/wishlist.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository, private readonly userRepository: UserRepository) {}

  async getAllByUserIdPaginated(pageNumber: number): Promise<PagedResponse<EventWithCountsAndCreatorDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const offset = pageSize * (pageNumber || 0);

    const [entities, totalElements] = await this.eventRepository.findAll({
      pageSize,
      offset,
    });

    const dtos = await Promise.all(entities.map((entity) => toEventWithCountsAndCreatorDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async getUserEventsPaginated(param: {
    pageNumber: number;
    currentUserId: string;
  }): Promise<PagedResponse<EventWithCountsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;

    const offset = pageSize * (pageNumber || 0);

    const [entities, totalElements] = await this.eventRepository.findAllForUserid({
      userId: currentUserId,
      pageSize,
      offset,
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

    /*
    TODO: -->
        sendEmailForExistingAttendee(existingAttendeeEmails, event, currentUser);
        sendEmailForNotExistingAttendee(notExistingAttendeeEmails, event, currentUser);
     */

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
