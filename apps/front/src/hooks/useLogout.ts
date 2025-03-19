import { useAuth0 } from '@auth0/auth0-react'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'

import { resetStore } from '../core/store/features'

export function useLogout() {
  const { logout } = useAuth0()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return async () => {
    // Cancel every running queries
    await queryClient.cancelQueries()
    // Invalidate every queries
    await queryClient.invalidateQueries()
    // Clear react-query cache
    queryClient.getQueryCache().clear()
    // Clear redux store
    resetStore(dispatch)
    // Logout from auth0
    await logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`,
      },
    })
  }
}
