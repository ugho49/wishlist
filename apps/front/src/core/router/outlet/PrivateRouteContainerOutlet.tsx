import { Box, Container, containerClasses, styled } from '@mui/material'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { BottomNavigation } from '../../../components/common/BottomNavigation'
import { Navbar } from '../../../components/common/Navbar'
import { useFetchUserInfo } from '../../../hooks/domain/useFetchUserInfo'
import { setUser } from '../../store/features'

const ContainerStyled = styled(Container)({
  [`&.${containerClasses.root}`]: {
    marginTop: 2,
    marginBottom: '130px',
  },
})

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
      <Navbar />
      <Box component="main">
        <ContainerStyled fixed maxWidth="lg">
          <Outlet />
        </ContainerStyled>
      </Box>
      <BottomNavigation />
    </>
  )
}
