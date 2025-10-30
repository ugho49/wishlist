import { useCanGoBack, useLocation, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'

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
  const location = useLocation()
  const router = useRouter()
  const canGoBackTanstack = useCanGoBack()

  const { mainRoutes = DEFAULT_MAIN_ROUTES } = options

  // Show back button if we're not on main routes and have history
  const isMainRoute = useMemo(() => mainRoutes.includes(location.pathname), [location.pathname, mainRoutes])
  const canGoBack = useMemo(() => canGoBackTanstack && !isMainRoute, [canGoBackTanstack, isMainRoute])

  const handleGoBack = () => {
    if (canGoBackTanstack) {
      router.history.back()
    }
  }

  return {
    canGoBack,
    handleGoBack,
  }
}
