import { createFileRoute } from '@tanstack/react-router'

import { CreateEventPage } from '../../../../components/event/CreateEventPage'

export const Route = createFileRoute('/_authenticated/_with-layout/events/new')({
  component: () => <CreateEventPage />,
})
