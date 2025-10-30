import { createFileRoute } from '@tanstack/react-router'

import { PrivacyPolicyPage } from '../components/legal/PrivacyPolicyPage'

export const Route = createFileRoute('/privacy')({
  component: () => <PrivacyPolicyPage />,
})
