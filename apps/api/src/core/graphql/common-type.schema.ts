import z from 'zod'

import { PaginationFilters } from '../../gql/generated-types'

export const PaginationFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
}) satisfies z.ZodType<PaginationFilters>
