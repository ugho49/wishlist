import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { LoadingPage } from '../common/LoadingPage'

function getTo({ search }: { search: string }): string {
  const urlSearchParams = new URLSearchParams(search)
  const redirectUrl = urlSearchParams.get('redirectUrl')
  if (redirectUrl) {
    return redirectUrl
  }
  return '/'
}

export const LoginPage = () => {
  const { loginWithRedirect } = useAuth0()
  const location = useLocation()

  useEffect(() => {
    loginWithRedirect({
      appState: { returnTo: getTo(location) },
      authorizationParams: { screen_hint: 'login' },
    })
  }, [loginWithRedirect, location])

  return <LoadingPage />
}
