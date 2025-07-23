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
  height: '100vh',
  [theme.breakpoints.up('md')]: {
    marginLeft: 280, // Make room for side navigation
  },
}))

const ContainerStyled = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginTop: '64px', // Space for fixed mobile top bar
    marginBottom: '56px', // Space for fixed mobile bottom bar
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
      {/* Side Navigation - responsive drawer */}
      <SideNavigation />

      {/* Mobile Top Bar - only visible on mobile */}
      <MobileTopBar />

      <MainWrapper>
        <ContainerStyled fixed maxWidth="lg">
          <Outlet />
        </ContainerStyled>
      </MainWrapper>

      {/* Mobile Bottom Navigation - only visible on mobile */}
      <MobileBottomNavigation />
    </>
  )
}
