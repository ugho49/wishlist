import { useMemo } from 'react'
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'

import { useHistoryStack } from './useHistoryStack'

interface UseBackNavigationOptions {
  /**
   * Routes considered as main routes where back button should not be shown
   * @default ['/', '/events', '/wishlists', '/admin', '/user/profile']
   */
  mainRoutes?: string[]
}

interface UseBackNavigationReturn {
  /**
   * Whether the back button should be shown
   */
  canGoBack: boolean
  /**
   * Function to handle back navigation
   */
  handleGoBack: () => void
}

const DEFAULT_MAIN_ROUTES = ['/', '/events', '/wishlists', '/admin', '/user/profile']

/**
 * Hook to handle back navigation logic
 * Provides a unified way to determine if back navigation is possible and handle it
 */
export const useBackNavigation = (options: UseBackNavigationOptions = {}): UseBackNavigationReturn => {
  const router = useRouter()
  const location = useLocation()
  const { history } = useHistoryStack()

  const { mainRoutes = DEFAULT_MAIN_ROUTES } = options

  // Show back button if we're not on main routes and have history
  const isMainRoute = useMemo(() => mainRoutes.includes(location.pathname), [location.pathname, mainRoutes])
  const canGoBack = useMemo(() => history.length > 0 && !isMainRoute, [history.length, isMainRoute])

  const handleGoBack = () => {
    router.history.back()
  }

  return {
    canGoBack,
    handleGoBack,
  }
}
