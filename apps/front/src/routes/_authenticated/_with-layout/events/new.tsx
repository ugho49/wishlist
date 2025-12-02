import { createFileRoute } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'

import { CreateEventPage } from '../../../../components/event/CreateEventPage'

export const Route = createFileRoute('/_authenticated/_with-layout/events/new')({
  component: () => (
    <>
      <SEO
        title="Créer un événement"
        description="Créez un nouvel événement et invitez vos proches à partager leurs listes de souhaits."
        canonical="/events/new"
      />
      <CreateEventPage />
    </>
  ),
})
