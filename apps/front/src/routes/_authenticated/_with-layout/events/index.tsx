import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { EventListPage } from '../../../../components/event/EventListPage'

export const Route = createFileRoute('/_authenticated/_with-layout/events/')({
  component: () => <EventListPage />,
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
})
