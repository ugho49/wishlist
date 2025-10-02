import { useEffect, useState } from 'react'
import { useLocation } from '@tanstack/react-router'

export function useHistoryStack() {
  const [stack, setStack] = useState<string[]>([])
  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    // TanStack Router doesn't expose navigation type like react-router-dom
    // We'll use a simpler approach by tracking pathname changes
    setStack(prevState => {
      // If pathname is already in stack, it's likely a back navigation
      const existingIndex = prevState.indexOf(pathname)
      if (existingIndex !== -1) {
        return prevState.slice(0, existingIndex + 1)
      }
      // Otherwise, it's a forward navigation
      return [...prevState, pathname]
    })
  }, [pathname])

  useEffect(() => {
    if (stack.length > 40) {
      setStack(prevState => prevState.splice(20, Number.POSITIVE_INFINITY))
    }
  }, [stack, setStack])

  return { history: stack, resetHistory: () => setStack([]) }
}
