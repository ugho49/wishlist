import { createFileRoute } from '@tanstack/react-router'

import { SecretSantaPage } from '../../components/secret-santa/SecretSantaPage'

export const Route = createFileRoute('/_authenticated/events/$eventId/secret-santa')({
  component: SecretSantaPage,
})
