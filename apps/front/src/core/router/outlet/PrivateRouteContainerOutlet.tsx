import { useAuth0 } from '@auth0/auth0-react'
import { Box, Container, containerClasses } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { BottomNavigation } from '../../../components/common/BottomNavigation'
import { LoadingPage } from '../../../components/common/LoadingPage'
import { Navbar } from '../../../components/common/Navbar'

const useStyles = makeStyles(() => ({
  container: {
    [`&.${containerClasses.root}`]: {
      marginTop: 2,
      marginBottom: '130px',
    },
  },
}))

function getSearchParams({ pathname, search }: { pathname: string; search: string }): string {
  if (pathname !== '/') {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('redirectUrl', `${pathname}${search}`)
    return urlSearchParams.toString()
  }
  return ''
}

export const PrivateRouteContainerOutlet = () => {
  const classes = useStyles()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate replace to={{ pathname: '/login', search: getSearchParams(location) }} />
  }

  return (
    <>
      <Navbar />
      <Box component="main">
        <Container fixed component="section" maxWidth="lg" className={classes.container}>
          <Outlet />
        </Container>
      </Box>
      <BottomNavigation />
    </>
  )
}
