import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { resetStore } from '../core/store/features'

export function useLogout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const redirectToLogin = useCallback(() => navigate('/login'), [navigate])
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
    // Redirect to login page
    redirectToLogin()
  }
}
