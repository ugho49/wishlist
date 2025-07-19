import { Inject } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { Attendee, AttendeeAddedEvent, AttendeeRepository } from '@wishlist/api/attendee'
import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, USER_REPOSITORY } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { AttendeeRole } from '@wishlist/common'
import { uniq } from 'lodash'

import { CreateEventCommand, CreateEventResult, Event, EventRepository } from '../../domain'
import { eventMapper } from '../../infrastructure'

@CommandHandler(CreateEventCommand)
export class CreateEventUseCase implements IInferredCommandHandler<CreateEventCommand> {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateEventCommand): Promise<CreateEventResult> {
    const attendeeEmails = uniq(command.newEvent.attendees?.map(a => a.email) ?? [])
      // Remove the current user from the list of attendees
      .filter(email => email !== command.currentUser.email)
    const existingUsers = await this.userRepository.findByEmails(attendeeEmails)
    const eventId = this.eventRepository.newId()
    const attendees: Attendee[] = []

    // Add the current user as maintainer attendee
    const currentUser = await this.userRepository.findByIdOrFail(command.currentUser.id)

    attendees.push(
      Attendee.createFromExistingUser({
        id: this.attendeeRepository.newId(),
        eventId,
        user: currentUser,
        role: AttendeeRole.MAINTAINER,
      }),
    )

    for (const attendee of command.newEvent.attendees ?? []) {
      const user = existingUsers.find(u => u.email === attendee.email)
      const id = this.attendeeRepository.newId()
      const role = attendee.role ?? AttendeeRole.USER
      const newAttendee = user
        ? Attendee.createFromExistingUser({ id, eventId, user, role })
        : Attendee.createFromNonExistingUser({
            id,
            eventId,
            role,
            pendingEmail: attendee.email,
          })

      attendees.push(newAttendee)
    }

    const event = Event.create({
      id: eventId,
      title: command.newEvent.title,
      description: command.newEvent.description,
      eventDate: command.newEvent.eventDate,
      attendees,
    })

    await this.eventRepository.save(event)

    for (const attendee of attendees.filter(a => a.user?.id !== currentUser.id)) {
      await this.eventBus.publish(new AttendeeAddedEvent({ event, newAttendee: attendee, invitedBy: currentUser }))
    }

    return eventMapper.toMiniEventDto(event)
  }
}
