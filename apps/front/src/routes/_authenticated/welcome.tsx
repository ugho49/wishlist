import { createFileRoute } from '@tanstack/react-router'

import { WelcomePage } from '../../components/onboarding/WelcomePage'

export const Route = createFileRoute('/_authenticated/welcome')({
  component: WelcomePage,
})
