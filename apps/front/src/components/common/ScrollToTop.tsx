import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

/**
 * Component that scrolls to top when the route changes.
 * Should be placed inside the Router.
 */
export const ScrollToTop = () => {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = router.subscribe('onResolved', () => {
      // Scroll to top when route changes
      window.scrollTo(0, 0)
    })

    return () => unsubscribe()
  }, [router])

  // This component doesn't render anything
  return null
}
