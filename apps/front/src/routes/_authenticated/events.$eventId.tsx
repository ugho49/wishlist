import { createFileRoute } from '@tanstack/react-router'

import { EventPage } from '../../components/event/EventPage'

export const Route = createFileRoute('/_authenticated/events/$eventId')({
  component: EventPage,
})
