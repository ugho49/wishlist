import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import z from 'zod'

import { EventListPage } from '../../../../components/event/EventListPage'

export const Route = createFileRoute('/_authenticated/_with-layout/events/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
  component: () => (
    <>
      <SEO
        title="Mes événements"
        description="Gérez tous vos événements et leurs listes de souhaits associées."
        canonical="/events"
      />
      <EventListPage />
    </>
  ),
})
