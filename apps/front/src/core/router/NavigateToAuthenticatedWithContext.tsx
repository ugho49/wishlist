import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function getTo({ search }: { search: string }): string {
  const urlSearchParams = new URLSearchParams(search)
  const redirectUrl = urlSearchParams.get('redirectUrl')
  if (redirectUrl) {
    return redirectUrl
  }
  return '/'
}

export const NavigateToAuthenticatedWithContext = () => {
  const location = useLocation()

  return <Navigate replace to={getTo(location)} />
}
