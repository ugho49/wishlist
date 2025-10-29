import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * Component that scrolls to top when the route changes.
 * Should be placed inside the Router but outside of Routes.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0)
  }, [pathname])

  // This component doesn't render anything
  return null
}
