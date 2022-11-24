import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventInputDto,
  createPagedResponse,
  DetailedEventDto,
  EventWithCountsDto,
  MiniEventDto,
  PagedResponse,
} from '@wishlist/common-types';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { toDetailedEventDto, toEventWithCountsDtoDto, toMiniEventDto } from './event.mapper';
import { EventRepository } from './event.repository';
import { ICurrentUser } from '../auth';
import { uniq } from 'lodash';
import { AttendeeEntity } from '../attendee/attendee.entity';
import { EventEntity } from './event.entity';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository, private readonly userRepository: UserRepository) {}

  async getUserEventsPaginated(param: {
    pageNumber: number;
    currentUserId: string;
  }): Promise<PagedResponse<EventWithCountsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;

    const offset = pageSize * (pageNumber || 0);

    const [entities, totalElements] = await this.eventRepository.getUserEventsPaginated({
      userId: currentUserId,
      pageSize,
      offset,
    });

    const dtos = await Promise.all(entities.map((entity) => toEventWithCountsDtoDto(entity)));

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
      const baseParams = { eventId: eventEntity.id, role: attendee.role };
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
}
