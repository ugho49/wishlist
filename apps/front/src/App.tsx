import { FeatureFlags } from '@wishlist/common'

import { MaintenancePage } from './components/common/MaintenancePage'
import { useFeatureFlag } from './hooks/useFeatureFlag'
import { AppRouter } from './Router'

export const App = () => {
  const maintenancePageEnabled = useFeatureFlag(FeatureFlags.FRONTEND_MAINTENANCE_PAGE_ENABLED)

  if (maintenancePageEnabled) {
    return <MaintenancePage />
  }

  return <AppRouter />
}
