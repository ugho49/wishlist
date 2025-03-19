import { useEffect } from 'react'

import { useLogout } from '../../hooks'
import { LoadingPage } from '../common/LoadingPage'

export const LogoutPage = () => {
  const logout = useLogout()

  useEffect(() => {
    logout()
  }, [])

  return <LoadingPage />
}
