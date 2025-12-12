import type { DetailedWishlistDto, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'
import type {
  DetailedWishlistObject,
  WishlistConfigObject,
  WishlistsPageObject,
  WishlistWithEventsObject,
} from '../types'

import { eventGraphQLMapper } from '../../../../event/infrastructure/graphql'
import { userGraphQLMapper } from '../../../../user/infrastructure/graphql'

export const wishlistGraphQLMapper = {
  toWishlistConfigObject(hideItems: boolean): WishlistConfigObject {
    return {
      hideItems,
    }
  },

  toWishlistWithEventsObject(dto: WishlistWithEventsDto): WishlistWithEventsObject {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      logoUrl: dto.logo_url,
      owner: userGraphQLMapper.toMiniUserObject(dto.owner),
      coOwner: dto.co_owner ? userGraphQLMapper.toMiniUserObject(dto.co_owner) : undefined,
      config: wishlistGraphQLMapper.toWishlistConfigObject(dto.config.hide_items),
      events: dto.events.map(e => eventGraphQLMapper.toMiniEventObject(e)),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toDetailedWishlistObject(dto: DetailedWishlistDto): DetailedWishlistObject {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      logoUrl: dto.logo_url,
      owner: userGraphQLMapper.toMiniUserObject(dto.owner),
      coOwner: dto.co_owner ? userGraphQLMapper.toMiniUserObject(dto.co_owner) : undefined,
      events: dto.events.map(e => eventGraphQLMapper.toMiniEventObject(e)),
      config: wishlistGraphQLMapper.toWishlistConfigObject(dto.config.hide_items),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  },

  toWishlistsPageObject(page: PagedResponse<WishlistWithEventsDto>): WishlistsPageObject {
    const { pagination } = page
    const isLastPage = pagination.page_number >= pagination.total_pages
    return {
      resources: page.resources.map(w => wishlistGraphQLMapper.toWishlistWithEventsObject(w)),
      totalElements: pagination.total_elements,
      totalPages: pagination.total_pages,
      currentPage: pagination.page_number,
      pageSize: pagination.pages_size,
      isLastPage,
    }
  },
}
