import { createFileRoute } from '@tanstack/react-router'

import { AdminEventPage } from '../../components/event/admin/AdminEventPage'

export const Route = createFileRoute('/_authenticated/admin/events/$eventId')({
  component: AdminEventPage,
})
