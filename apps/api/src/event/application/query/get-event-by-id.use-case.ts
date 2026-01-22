import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { EventRepository, eventMapper } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { DetailedEventDto, EventId, ICurrentUser } from '@wishlist/common'

export type GetEventByIdInput = {
  currentUser: ICurrentUser
  eventId: EventId
}

@Injectable()
export class GetEventByIdUseCase {
  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: GetEventByIdInput): Promise<DetailedEventDto> {
    const event = await this.eventRepository.findByIdOrFail(input.eventId)

    if (!event.canView(input.currentUser)) {
      throw new UnauthorizedException('You cannot access this event')
    }

    const wishlists = await this.wishlistRepository.findByEvent(event.id)

    return eventMapper.toDetailedEventDto({ event, wishlists })
  }
}
