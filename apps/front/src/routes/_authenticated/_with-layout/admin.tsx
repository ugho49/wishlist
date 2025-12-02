import type { RootState } from '../../../core'

import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { SEO } from '@wishlist/front-components/SEO'
import { useSelector } from 'react-redux'

const mapUser = (state: RootState) => state.auth.user

export const Route = createFileRoute('/_authenticated/_with-layout/admin')({
  component: () => {
    const user = useSelector(mapUser)
    const isAdmin = user?.isAdmin || false

    if (!isAdmin) {
      return <Navigate to="/" replace />
    }

    return (
      <>
        <SEO title="Administration" description="Panneau d'administration de Wishlist." />
        <Outlet />
      </>
    )
  },
})
