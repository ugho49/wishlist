import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { LegacyUserRepository } from '@wishlist/api/user'
import { LegacyWishlistRepository, WishlistEntity } from '@wishlist/api/wishlist'
import { AddEventAttendeeForEventInputDto, AttendeeDto, AttendeeId, AttendeeRole, ICurrentUser } from '@wishlist/common'

import { EventMailer } from '../../event/infrastructure/event.mailer'
import { LegacyEventRepository } from '../../event/infrastructure/legacy-event.repository'
import { AttendeeEntity } from './legacy-attendee.entity'
import { toAttendeeDto } from './legacy-attendee.mapper'
import { LegacyAttendeeRepository } from './legacy-attendee.repository'

@Injectable()
export class LegacyAttendeeService {
  private readonly logger = new Logger(LegacyAttendeeService.name)

  constructor(
    private readonly attendeeRepository: LegacyAttendeeRepository,
    private readonly eventRepository: LegacyEventRepository,
    private readonly userRepository: LegacyUserRepository,
    private readonly wishlistRepository: LegacyWishlistRepository,
    private readonly eventMailer: EventMailer,
  ) {}

  async addAttendee(param: { currentUser: ICurrentUser; dto: AddEventAttendeeForEventInputDto }): Promise<AttendeeDto> {
    const { dto, currentUser } = param
    const eventEntity = await this.eventRepository.findOneBy({ id: param.dto.event_id })

    if (!eventEntity) {
      throw new NotFoundException('Event not found')
    }

    const canEdit = await eventEntity.canEdit(currentUser)

    if (!canEdit) {
      throw new UnauthorizedException('Only maintainers of the event can update an attendee')
    }

    if (await this.attendeeRepository.existByEventAndEmail({ eventId: dto.event_id, email: dto.email })) {
      throw new BadRequestException('This attendee already exist for this event')
    }

    const user = await this.userRepository.findByEmail(dto.email)

    const baseParams = { eventId: eventEntity.id, role: dto.role ?? AttendeeRole.USER }

    const attendeeEntity = user
      ? AttendeeEntity.createFromExistingUser({ ...baseParams, userId: user.id })
      : AttendeeEntity.createFromNonExistingUser({ ...baseParams, email: dto.email })

    await this.attendeeRepository.insert(attendeeEntity)
    const invitedBy = await this.userRepository.findOneByOrFail({ id: currentUser.id })

    try {
      if (user) {
        attendeeEntity.user = Promise.resolve(user)

        await this.eventMailer.sendEmailForExistingAttendee({
          emails: dto.email,
          event: eventEntity,
          invitedBy,
        })
      } else {
        await this.eventMailer.sendEmailForNotExistingAttendee({
          emails: dto.email,
          event: eventEntity,
          invitedBy,
        })
      }
    } catch (e) {
      this.logger.error('Fail to send mail to new attendee', e)
    }

    return toAttendeeDto(attendeeEntity)
  }

  async deleteAttendee(param: { currentUser: ICurrentUser; attendeeId: AttendeeId }): Promise<void> {
    const { attendeeId, currentUser } = param
    const attendeeEntity = await this.attendeeRepository.findOneBy({ id: attendeeId })

    if (!attendeeEntity) {
      throw new NotFoundException('Attendee not found')
    }

    const eventEntity = await attendeeEntity.event
    const canEdit = await eventEntity.canEdit(currentUser)

    if (!canEdit) {
      throw new UnauthorizedException('Only maintainers of the event can delete an attendee')
    }

    if (attendeeEntity.userId === currentUser.id) {
      throw new ConflictException('You cannot delete yourself from the event')
    }

    const event = await attendeeEntity.event
    const wishlists = await event.wishlists.then(wishlists =>
      wishlists.filter(wishlist => wishlist.ownerId === attendeeEntity.userId),
    )

    await this.attendeeRepository.transaction(async em => {
      for (const wishlist of wishlists) {
        const [events, items] = await Promise.all([wishlist.events, wishlist.items])

        if (events.length > 1) {
          await this.wishlistRepository.unlinkEvent({ wishlistId: wishlist.id, eventId: event.id, em })
          continue
        }

        if (events.length === 1 && items.length > 0) {
          throw new ConflictException(
            'You remove this attendee from the event because he have a list in this event and the list have only this event attached',
          )
        }

        await em.delete(WishlistEntity, { id: wishlist.id })
      }

      await em.delete(AttendeeEntity, { id: attendeeId })
    })
  }
}
