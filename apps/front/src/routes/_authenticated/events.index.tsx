import { createFileRoute } from '@tanstack/react-router'

import { EventListPage } from '../../components/event/EventListPage'

export const Route = createFileRoute('/_authenticated/events/')({
  component: EventListPage,
})
