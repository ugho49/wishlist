import type { RootState } from '../../store'

import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const mapState = (state: RootState) => state.auth.user

export const AdminRouteOutlet: React.FC = () => {
  const user = useSelector(mapState)
  const isAdmin = user?.isAdmin || false

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
