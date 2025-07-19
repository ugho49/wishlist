import { Inject, UnauthorizedException } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { eventMapper, EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { GetEventByIdQuery, GetEventByIdResult } from '../../domain'

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdUseCase implements IInferredQueryHandler<GetEventByIdQuery> {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(query: GetEventByIdQuery): Promise<GetEventByIdResult> {
    const event = await this.eventRepository.findByIdOrFail(query.eventId)

    if (!event.canView(query.currentUser)) {
      throw new UnauthorizedException('You cannot access this event')
    }

    const wishlists = await this.wishlistRepository.findByEvent(event.id)

    return eventMapper.toDetailedEventDto({ event, wishlists })
  }
}
