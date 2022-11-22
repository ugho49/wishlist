import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import { EventWithCountsDto, GetPaginationQueryDto, PagedResponse } from '@wishlist/common-types';
import { CurrentUser } from '../auth';

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getMyEvents(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getUserEventsPaginated({ pageNumber: queryParams.p, currentUserId });
  }
  //
  // @Get('/:id')
  // async getWishlistById(
  //   @Param('id') wishlistId: string,
  //   @CurrentUser('id') currentUserId: string
  // ): Promise<DetailledWishlistDto> {
  //   return this.wishlistService.findById({ wishlistId, currentUserId });
  // }

  /*
      @GetMapping
    public PagedResponse<MyEventResponse> getMyEvents(@UserId UUID currentUserId,
                                                      @RequestParam(name = "p", required = false, defaultValue = "0") int p) {
        return getEventUseCase.getUserEventsPaginated(currentUserId, p);
    }

    @GetMapping("/{eventId}")
    public Event getEventById(@UserId UUID currentUserId, @PathVariable("eventId") UUID eventId) {
        return getEventUseCase.getById(eventId, currentUserId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedResponse createEvent(@LoggedUser CurrentUser currentUser, @Valid @RequestBody CreateEventRequest body) {
        return createEventUseCase.create(currentUser, body);
    }
   */
}
