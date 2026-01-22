import { Inject, Injectable, Logger } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { AttendeeRole, ICurrentUser, MiniEventDto } from '@wishlist/common'
import { uniq } from 'lodash'

import { AttendeeAddedEvent, Event, EventAttendee, EventAttendeeRepository, EventRepository } from '../../domain'
import { eventMapper } from '../../infrastructure'

type NewEventAttendee = {
  email: string
  role?: AttendeeRole
}

type NewEvent = {
  title: string
  description?: string
  icon?: string
  eventDate: Date
  attendees?: NewEventAttendee[]
}

export type CreateEventInput = {
  currentUser: ICurrentUser
  newEvent: NewEvent
}

@Injectable()
export class CreateEventUseCase {
  private readonly logger = new Logger(CreateEventUseCase.name)

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateEventInput): Promise<MiniEventDto> {
    this.logger.log('Create event request received', { input })
    const attendeeEmails = uniq(input.newEvent.attendees?.map(a => a.email) ?? [])
      // Remove the current user from the list of attendees
      .filter(email => email !== input.currentUser.email)
    const existingUsers = await this.userRepository.findByEmails(attendeeEmails)
    const eventId = this.eventRepository.newId()
    const attendees: EventAttendee[] = []

    // Add the current user as maintainer attendee
    const currentUser = await this.userRepository.findByIdOrFail(input.currentUser.id)

    attendees.push(
      EventAttendee.createFromExistingUser({
        id: this.attendeeRepository.newId(),
        eventId,
        user: currentUser,
        role: AttendeeRole.MAINTAINER,
      }),
    )

    for (const attendee of input.newEvent.attendees ?? []) {
      const user = existingUsers.find(u => u.email === attendee.email)
      const id = this.attendeeRepository.newId()
      const role = attendee.role ?? AttendeeRole.USER
      const newAttendee = user
        ? EventAttendee.createFromExistingUser({ id, eventId, user, role })
        : EventAttendee.createFromNonExistingUser({
            id,
            eventId,
            role,
            pendingEmail: attendee.email,
          })

      attendees.push(newAttendee)
    }

    const event = Event.create({
      id: eventId,
      title: input.newEvent.title,
      description: input.newEvent.description,
      icon: input.newEvent.icon,
      eventDate: input.newEvent.eventDate,
      attendees,
    })

    this.logger.log('Saving event...', { event })
    await this.eventRepository.save(event)

    for (const attendee of attendees.filter(a => a.user?.id !== currentUser.id)) {
      await this.eventBus.publish(new AttendeeAddedEvent({ event, newAttendee: attendee, invitedBy: currentUser }))
    }

    return eventMapper.toMiniEventDto(event)
  }
}
