import type { RootState } from '../../../../core'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const mapAuthState = (state: RootState) => state.auth

export const AnonymousRouteGuard = () => {
  const { accessToken } = useSelector(mapAuthState)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const isLoggedIn = accessToken !== undefined

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isLoggedIn) {
      timeout = setTimeout(() => {
        setShouldRedirect(true)
      }, 1000)
    } else {
      setShouldRedirect(false)
    }

    return () => clearTimeout(timeout)
  }, [isLoggedIn])

  return shouldRedirect ? <Navigate replace to={{ pathname: '/' }} /> : <Outlet />
}
