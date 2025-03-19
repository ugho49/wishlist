import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'

import { LoadingPage } from '../common/LoadingPage'

export const RegisterPage = () => {
  const { loginWithRedirect } = useAuth0()

  useEffect(() => {
    loginWithRedirect({
      authorizationParams: { screen_hint: 'signup' },
    })
  }, [loginWithRedirect])

  return <LoadingPage />
}
