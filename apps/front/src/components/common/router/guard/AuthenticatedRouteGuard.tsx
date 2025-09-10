import type { RootState } from '../../../../core'

import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const mapAuthState = (state: RootState) => state.auth

function getSearchParams({ pathname, search }: { pathname: string; search: string }): string {
  if (pathname !== '/') {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('redirectUrl', `${pathname}${search}`)
    return urlSearchParams.toString()
  }
  return ''
}

export const AuthenticatedRouteGuard = () => {
  const location = useLocation()
  const { accessToken } = useSelector(mapAuthState)
  const isLoggedIn = accessToken !== undefined

  return isLoggedIn ? <Outlet /> : <Navigate replace to={{ pathname: '/login', search: getSearchParams(location) }} />
}
