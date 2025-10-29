import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { AdminListEventsPage } from '../../../../../components/event/admin/AdminListEventsPage'

export const Route = createFileRoute('/_authenticated/_with-layout/admin/events/')({
  component: () => <AdminListEventsPage />,
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
})
