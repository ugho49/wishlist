import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AttendeeRepository } from './attendee.repository';
import { AddEventAttendeeForEventInputDto, AttendeeDto, AttendeeRole, ICurrentUser } from '@wishlist/common-types';
import { EventRepository } from '../event/event.repository';
import { UserRepository } from '../user/user.repository';
import { AttendeeEntity } from './attendee.entity';
import { toAttendeeDto } from './attendee.mapper';
import { EventMailer } from '../event/event.mailer';

@Injectable()
export class AttendeeService {
  private readonly logger = new Logger(AttendeeService.name);

  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly eventRepository: EventRepository,
    private readonly userRepository: UserRepository,
    private readonly eventMailer: EventMailer
  ) {}

  async addAttendee(param: { currentUser: ICurrentUser; dto: AddEventAttendeeForEventInputDto }): Promise<AttendeeDto> {
    const { dto, currentUser } = param;
    const eventEntity = await this.eventRepository.findOneBy({ id: param.dto.event_id });

    if (!eventEntity) {
      throw new NotFoundException('Event not found');
    }

    const creator = await eventEntity.creator;
    const userCanDeleteEvent = creator.id === currentUser.id || currentUser.isAdmin;

    // TODO: handle role EDITOR or ADMIN
    if (!userCanDeleteEvent) {
      throw new UnauthorizedException('Only the creator of the event can update an attendee');
    }

    if (await this.attendeeRepository.existByEventAndEmail({ eventId: dto.event_id, email: dto.email })) {
      throw new BadRequestException('This attendee already exist for this event');
    }

    if (creator.email === dto.email) {
      throw new ConflictException('The attendee email is the same as the event creator email');
    }

    const user = await this.userRepository.findByEmail(dto.email);

    const baseParams = { eventId: eventEntity.id, role: dto.role || AttendeeRole.USER };

    const attendeeEntity = user
      ? AttendeeEntity.createFromExistingUser({ ...baseParams, userId: user.id })
      : AttendeeEntity.createFromNonExistingUser({ ...baseParams, email: dto.email });

    await this.attendeeRepository.insert(attendeeEntity);

    try {
      if (user) {
        await this.eventMailer.sendEmailForExistingAttendee({ emails: dto.email, event: eventEntity, creator });
      } else {
        await this.eventMailer.sendEmailForNotExistingAttendee({ emails: dto.email, event: eventEntity, creator });
      }
    } catch (e) {
      this.logger.error('Fail to send mail to new attendee', e);
    }

    return toAttendeeDto(attendeeEntity);
  }

  async deleteAttendee(param: { currentUser: ICurrentUser; attendeeId: string }): Promise<void> {
    const { attendeeId, currentUser } = param;
    const attendeeEntity = await this.attendeeRepository.findOneBy({ id: attendeeId });

    if (!attendeeEntity) {
      throw new NotFoundException('Attendee not found');
    }

    const eventEntity = await attendeeEntity.event;
    const creator = await eventEntity.creator;
    const userCanDeleteEvent = creator.id === currentUser.id || currentUser.isAdmin;

    // TODO: handle role EDITOR or ADMIN
    if (!userCanDeleteEvent) {
      throw new UnauthorizedException('Only the creator of the event can delete an attendee');
    }

    // TODO: do not allow attendee deletion if he have a list and only one event

    await this.attendeeRepository.delete({ id: attendeeId });
  }
}
