import { useEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function useHistoryStack() {
  const [stack, setStack] = useState<string[]>([])
  const { pathname } = useLocation()
  const type = useNavigationType()

  useEffect(() => {
    if (type === 'POP') {
      setStack(prevState => prevState.slice(0, prevState.length - 1))
    } else if (type === 'PUSH') {
      setStack(prevState => [...prevState, pathname])
    } else if (type === 'REPLACE') {
      setStack(prevState => {
        // We cannot replace if no previous stack
        if (prevState.length === 0) return prevState
        return [...prevState.slice(0, prevState.length - 1), pathname]
      })
    }
  }, [pathname, type, setStack])

  useEffect(() => {
    if (stack.length > 40) {
      setStack(prevState => prevState.splice(20, Number.POSITIVE_INFINITY))
    }
  }, [stack, setStack])

  return { history: stack, resetHistory: () => setStack([]) }
}
