import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

function getTo({ search }: { search: URLSearchParams }): string {
  const redirectUrl = search.get('redirectUrl')
  if (redirectUrl) {
    return redirectUrl
  }
  return '/'
}

export const NavigateToAuthenticatedWithContext = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: getTo(location), replace: true })
  }, [navigate, location])

  return null
}
