import type { EventId } from '@wishlist/common'

import { createFileRoute } from '@tanstack/react-router'

import { AdminEventPage } from '../../../../../components/event/admin/AdminEventPage'

export const Route = createFileRoute('/_authenticated/_with-layout/admin/events/$eventId')({
  params: {
    parse: params => ({ eventId: params.eventId as EventId }),
  },
  component: () => {
    const { eventId } = Route.useParams()
    return <AdminEventPage eventId={eventId} />
  },
})
