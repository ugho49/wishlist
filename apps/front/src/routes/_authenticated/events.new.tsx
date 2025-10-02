import { createFileRoute } from '@tanstack/react-router'

import { CreateEventPage } from '../../components/event/CreateEventPage'

export const Route = createFileRoute('/_authenticated/events/new')({
  component: CreateEventPage,
})
