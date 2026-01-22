import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { AttendeeDto, AttendeeRole, EventId, ICurrentUser } from '@wishlist/common'

import { AttendeeAddedEvent, EventAttendee, EventAttendeeRepository, EventRepository } from '../../domain'
import { eventAttendeeMapper } from '../../infrastructure'

export type AddAttendeeInput = {
  currentUser: ICurrentUser
  eventId: EventId
  newAttendee: {
    email: string
    role?: AttendeeRole
  }
}

@Injectable()
export class AddAttendeeUseCase {
  private readonly logger = new Logger(AddAttendeeUseCase.name)

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE)
    private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: AddAttendeeInput): Promise<AttendeeDto> {
    const { eventId, currentUser } = input
    this.logger.log('Add attendee request received', { eventId, currentUser })

    const event = await this.eventRepository.findByIdOrFail(eventId)

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can add an attendee')
    }

    const attendeeAlreadyExists = event.attendees.some(attendee => attendee.getEmail() === input.newAttendee.email)

    if (attendeeAlreadyExists) {
      throw new BadRequestException('This attendee already exist for this event')
    }

    const user = await this.userRepository.findByEmail(input.newAttendee.email)
    const role = input.newAttendee.role ?? AttendeeRole.USER
    const attendeeId = this.attendeeRepository.newId()

    const newAttendee = user
      ? EventAttendee.createFromExistingUser({
          id: attendeeId,
          eventId,
          user,
          role,
        })
      : EventAttendee.createFromNonExistingUser({
          id: attendeeId,
          eventId,
          pendingEmail: input.newAttendee.email,
          role,
        })

    this.logger.log('Saving attendee...', { newAttendee })
    await this.attendeeRepository.save(newAttendee)

    const invitedBy = await this.userRepository.findByIdOrFail(currentUser.id)

    await this.eventBus.publish(
      new AttendeeAddedEvent({
        event,
        newAttendee: newAttendee,
        invitedBy,
      }),
    )

    return eventAttendeeMapper.toAttendeeDto(newAttendee)
  }
}
