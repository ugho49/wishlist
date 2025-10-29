import type { ItemId, WishlistId } from '@wishlist/common'

import { createFileRoute } from '@tanstack/react-router'
import { FilterType, SortType } from '@wishlist/front-components/wishlist/WishlistFilterAndSortItems'
import z from 'zod'

import { WishlistPage } from '../../../../../components/wishlist/WishlistPage'

export const Route = createFileRoute('/_authenticated/_with-layout/wishlists/$wishlistId/')({
  params: {
    parse: params => ({ wishlistId: params.wishlistId as WishlistId }),
  },
  component: () => {
    const { wishlistId } = Route.useParams()
    return <WishlistPage wishlistId={wishlistId} />
  },
  validateSearch: z.object({
    showEventDialog: z.boolean().optional().catch(false).default(false),
    showImportDialog: z.boolean().optional().catch(false).default(false),
    currentItemId: z.optional(z.custom<ItemId>()),
    displayAddItemFormDialog: z.boolean().optional().catch(false).default(false),
    sort: z.enum(SortType).optional().catch(SortType.CREATED_AT_DESC).default(SortType.CREATED_AT_DESC),
    filter: z.enum(FilterType).optional().catch(FilterType.NONE).default(FilterType.NONE),
  }),
})
