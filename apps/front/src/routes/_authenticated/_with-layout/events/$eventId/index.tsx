import type { EventId } from '@wishlist/common'

import { createFileRoute } from '@tanstack/react-router'

import { EventPage } from '../../../../../components/event/EventPage'

export const Route = createFileRoute('/_authenticated/_with-layout/events/$eventId/')({
  params: {
    parse: params => ({ eventId: params.eventId as EventId }),
  },
  component: () => {
    const { eventId } = Route.useParams()
    return <EventPage eventId={eventId} />
  },
})
