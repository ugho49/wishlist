import React, { useCallback, useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useInterval } from 'usehooks-ts'

import { ApiContext } from '../../context/ApiContext'
import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'
import { AuthService } from '../services/auth.service'
import { RootState } from '../store'

const mapAuthState = (state: RootState) => state.auth
const accessTokenService = new AuthService().accessTokenService

export const AxiosInterceptor: React.FC = () => {
  const { accessToken } = useSelector(mapAuthState)
  const { setAccessToken, unsetTokens } = useContext(ApiContext)
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

  // Check token expiration every seconds ->
  useInterval(() => {
    void checkTokenExpiration()
  }, 1000)

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken)
    } else {
      unsetTokens()
    }
  }, [accessToken])

  return null
}
