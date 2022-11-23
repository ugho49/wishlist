import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventInputDto,
  createPagedResponse,
  DetailledEventDto,
  EventWithCountsDto,
  MiniEventDto,
  PagedResponse,
} from '@wishlist/common-types';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { toDetailledEventDto, toEventWithCountsDtoDto, toMiniEventDto } from './mappers/event.mapper';
import { EventRepository } from './event.repository';
import { ICurrentUser } from '../auth';
import { UserService } from '../user';
import { uniq } from 'lodash';
import { AttendeeEntity } from './entities/attendee.entity';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository, private readonly userService: UserService) {}

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
      options: { pageSize, totalElements, currentIndex: pageNumber },
    });
  }

  async findById(param: { eventId: string; currentUserId: string }): Promise<DetailledEventDto> {
    const entity = await this.eventRepository.findByIdAndUserId({
      eventId: param.eventId,
      userId: param.currentUserId,
    });

    if (!entity) {
      throw new NotFoundException('Event not found');
    }

    return toDetailledEventDto(entity);
  }

  async create(param: { currentUser: ICurrentUser; dto: CreateEventInputDto }): Promise<MiniEventDto> {
    const { currentUser, dto } = param;
    const attendees = dto.attendees.filter((a) => a.email !== currentUser.email);
    const attendeeEmails = uniq(attendees.map((a) => a.email));
    const existingUsers = await this.userService.findEntitiesByEmail(attendeeEmails);
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

    await this.eventRepository.transaction(async (em) => {
      await em.insert(EventEntity, eventEntity);
      await em.insert(AttendeeEntity, attendeeEntities);
    });

    /*
    TODO: -->
        sendEmailForExistingAttendee(existingAttendeeEmails, event, currentUser);
        sendEmailForNotExistingAttendee(notExistingAttendeeEmails, event, currentUser);
     */

    return toMiniEventDto(eventEntity);
  }
}
