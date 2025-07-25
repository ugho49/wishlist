import { Box, Container, containerClasses, styled } from '@mui/material'
import { useFetchUserInfo } from '@wishlist/front-hooks'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { setUser } from '../../../core/store/features'
import { MobileBottomNavigation } from '../MobileBottomNavigation'
import { MobileTopBar } from '../MobileTopBar'
import { SideNavigation } from '../SideNavigation'

const MainWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginLeft: 280, // Make room for side navigation
  },
}))

const ContainerStyled = styled(Container)(({ theme }) => ({
  [`&.${containerClasses.root}`]: {
    marginBottom: '130px',

    [theme.breakpoints.down('md')]: {
      marginTop: '56px',
    },
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

      <MainWrapper as="main">
        <ContainerStyled fixed maxWidth="lg">
          <Outlet />
        </ContainerStyled>
      </MainWrapper>

      {/* Mobile Bottom Navigation - only visible on mobile */}
      <MobileBottomNavigation />
    </>
  )
}
