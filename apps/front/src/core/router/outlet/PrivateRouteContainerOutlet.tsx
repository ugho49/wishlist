import { Box, Container, containerClasses } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { BottomNavigation } from '../../../components/common/BottomNavigation'
import { Navbar } from '../../../components/common/Navbar'
import { useFetchUserInfo } from '../../../hooks/domain/useFetchUserInfo'
import { setUser } from '../../store/features'

const useStyles = makeStyles(() => ({
  container: {
    [`&.${containerClasses.root}`]: {
      marginTop: 2,
      marginBottom: '130px',
    },
  },
}))

export const PrivateRouteContainerOutlet = () => {
  const classes = useStyles()
  const { user } = useFetchUserInfo()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      dispatch(setUser({ firstName: user.firstname, lastName: user.lastname, pictureUrl: user.picture_url }))
    }
  }, [user, dispatch])

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
