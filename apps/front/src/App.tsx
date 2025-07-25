import { useFeatureFlagEnabled } from 'posthog-js/react'

import { MaintenancePage } from './components/common/MaintenancePage'
import { AppRouter } from './Router'

export const App = () => {
  const flagEnabled = useFeatureFlagEnabled('frontend-maintenance-page-enabled')

  if (flagEnabled) {
    return <MaintenancePage />
  }

  return <AppRouter />
}
