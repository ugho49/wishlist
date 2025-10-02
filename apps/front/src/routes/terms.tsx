import { createFileRoute } from '@tanstack/react-router'

import { TermsOfServicePage } from '../components/legal/TermsOfServicePage'

export const Route = createFileRoute('/terms')({
  component: TermsOfServicePage,
})
