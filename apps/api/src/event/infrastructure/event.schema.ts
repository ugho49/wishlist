import { PaginationFiltersSchema } from '@wishlist/api/core/graphql'
import z from 'zod'

import { EventPaginationFilters } from '../../gql/generated-types'

export const EventPaginationFiltersSchema = PaginationFiltersSchema.extend({
  onlyFuture: z.boolean().default(false),
}) satisfies z.ZodType<EventPaginationFilters>
