import { Box, Container, styled } from '@mui/material'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { MobileBottomNavigation } from '../../../components/common/MobileBottomNavigation'
import { MobileTopBar } from '../../../components/common/MobileTopBar'
import { SideNavigation } from '../../../components/common/SideNavigation'
import { useFetchUserInfo } from '../../../hooks/domain/useFetchUserInfo'
import { setUser } from '../../store/features'

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  height: '100vh',
  [theme.breakpoints.up('md')]: {
    marginLeft: 280, // Make room for side navigation
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '64px', // Space for fixed mobile top bar
    paddingBottom: '100px', // Space for fixed mobile bottom bar
  },
}))

export const PrivateRouteContainerOutlet = () => {
  const { user } = useFetchUserInfo()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      dispatch(setUser({ firstName: user.firstname, lastName: user.lastname, pictureUrl: user.picture_url }))
    }
  }, [user, dispatch])

  return (
    <>
      {/* Mobile Top Bar - only visible on mobile */}
      <MobileTopBar />

      {/* Side Navigation - responsive drawer */}
      <SideNavigation />

      {/* Mobile Bottom Navigation - only visible on mobile */}
      <MobileBottomNavigation />

      <MainWrapper>
        <Container fixed maxWidth="lg">
          <Outlet />
        </Container>
      </MainWrapper>
    </>
  )
}
