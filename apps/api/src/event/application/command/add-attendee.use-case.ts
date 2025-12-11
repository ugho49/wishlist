import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { AttendeeRole } from '@wishlist/common'

import {
  AddAttendeeCommand,
  AddAttendeeResult,
  AttendeeAddedEvent,
  EventAttendee,
  EventAttendeeRepository,
  EventRepository,
} from '../../domain'
import { eventAttendeeMapper } from '../../infrastructure'

@CommandHandler(AddAttendeeCommand)
export class AddAttendeeUseCase implements IInferredCommandHandler<AddAttendeeCommand> {
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

  async execute(command: AddAttendeeCommand): Promise<AddAttendeeResult> {
    const { eventId, currentUser } = command
    this.logger.log('Add attendee request received', { eventId, currentUser })

    const event = await this.eventRepository.findByIdOrFail(eventId)

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can add an attendee')
    }

    const attendeeAlreadyExists = event.attendees.some(attendee => attendee.getEmail() === command.newAttendee.email)

    if (attendeeAlreadyExists) {
      throw new BadRequestException('This attendee already exist for this event')
    }

    const user = await this.userRepository.findByEmail(command.newAttendee.email)
    const role = command.newAttendee.role ?? AttendeeRole.USER
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
          pendingEmail: command.newAttendee.email,
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
