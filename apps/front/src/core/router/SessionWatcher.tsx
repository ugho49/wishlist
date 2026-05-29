import type React from 'react'
import type { RootState } from '../store'

import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useInterval } from 'usehooks-ts'

import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'
import { AuthService } from '../services/auth.service'

const mapAuthState = (state: RootState) => state.auth
const accessTokenService = new AuthService().accessTokenService

/**
 * Watches the access token for expiry and logs the user out when it lapses.
 * (The GraphQL fetcher reads the token straight from localStorage, so there is
 * no longer an HTTP client instance to keep in sync.)
 */
export const SessionWatcher: React.FC = () => {
  const { accessToken } = useSelector(mapAuthState)
  const { addToast } = useToast()
  const logout = useLogout()

  const checkTokenExpiration = useCallback(async () => {
    // TODO change this to refreshToken -->
    if (accessToken && accessTokenService.isExpired(accessToken)) {
      // TODO get new accessToken from refreshToken when expired
      addToast({ message: 'Votre session à expiré', variant: 'warning' })
      await logout()
    }
  }, [accessToken, addToast, logout])

  useEffect(() => {
    void checkTokenExpiration()
  }, [checkTokenExpiration])

  // Check token expiration every second ->
  useInterval(() => {
    void checkTokenExpiration()
  }, 1000)

  return null
}
