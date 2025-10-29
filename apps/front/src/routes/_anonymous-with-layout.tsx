import type { RootState } from '../core'

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { AnonymousContainerOutlet } from '../components/common/router/outlet/AnonymousContainerOutlet'

const mapAuthState = (state: RootState) => state.auth

export const Route = createFileRoute('/_anonymous-with-layout')({
  component: () => {
    const { accessToken } = useSelector(mapAuthState)
    const [shouldRedirect, setShouldRedirect] = useState(false)
    const isLoggedIn = accessToken !== undefined

    useEffect(() => {
      let timeout: NodeJS.Timeout

      if (isLoggedIn) {
        // We need to wait for the page to be rendered before redirecting to avoid a flash of the login page
        timeout = setTimeout(() => {
          setShouldRedirect(true)
        }, 100)
      } else {
        setShouldRedirect(false)
      }

      return () => clearTimeout(timeout)
    }, [isLoggedIn])

    if (shouldRedirect) {
      return <Navigate to="/" replace />
    }

    return <AnonymousContainerOutlet />
  },
})
