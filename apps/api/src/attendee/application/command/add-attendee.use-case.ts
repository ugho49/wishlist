import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { Event, EventRepository } from '@wishlist/api/event'
import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, USER_REPOSITORY } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { AttendeeId, AttendeeRole, uuid } from '@wishlist/common'

import { AddAttendeeCommand, AddAttendeeResult, Attendee, AttendeeAddedEvent, AttendeeRepository } from '../../domain'
import { attendeeMapper } from '../../infrastructure'

@CommandHandler(AddAttendeeCommand)
export class AddAttendeeUseCase implements IInferredCommandHandler<AddAttendeeCommand> {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: AttendeeRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddAttendeeCommand): Promise<AddAttendeeResult> {
    const { eventId, currentUser } = command

    const event = await this.eventRepository.findByIdOrFail(eventId)
    const attendees = await this.attendeeRepository.findByEventId(eventId)

    if (!Event.canEdit({ currentUser, attendees })) {
      throw new UnauthorizedException('Only maintainers of the event can add an attendee')
    }

    const attendeeAlreadyExists = attendees.some(attendee => attendee.getEmail() === command.newAttendee.email)

    if (attendeeAlreadyExists) {
      throw new BadRequestException('This attendee already exist for this event')
    }

    const user = await this.userRepository.findByEmail(command.newAttendee.email)
    const role = command.newAttendee.role ?? AttendeeRole.USER
    const attendeeId = uuid() as AttendeeId

    const newAttendee = user
      ? Attendee.createFromExistingUser({
          id: attendeeId,
          eventId,
          user,
          role,
        })
      : Attendee.createFromNonExistingUser({
          id: attendeeId,
          eventId,
          pendingEmail: command.newAttendee.email,
          role,
        })

    await this.attendeeRepository.save(newAttendee)

    const invitedBy = await this.userRepository.findByIdOrFail(currentUser.id)

    await this.eventBus.publish(
      new AttendeeAddedEvent({
        event,
        newAttendee: newAttendee,
        invitedBy,
      }),
    )

    return attendeeMapper.toAttendeeDto(newAttendee)
  }
}
