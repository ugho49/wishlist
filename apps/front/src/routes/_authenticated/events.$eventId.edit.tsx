import { createFileRoute } from '@tanstack/react-router'

import { EditEventPage } from '../../components/event/EditEventPage'

export const Route = createFileRoute('/_authenticated/events/$eventId/edit')({
  component: EditEventPage,
})
