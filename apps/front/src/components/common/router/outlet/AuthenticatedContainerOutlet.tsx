import { Box, Container, containerClasses, styled, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setUser } from '../../../../core/store/features'
import { useUserProfileCurrentUserQuery } from '../../../../gql'
import { unwrapResult } from '../../../../gql/result'
import { useProfilePicturePrompt } from '../../../../hooks/useProfilePicturePrompt'
import { ProfilePicturePromptModal } from '../../../user/ProfilePicturePromptModal'
import { MobileBottomNavigation } from '../../MobileBottomNavigation'
import { MobileTopBar } from '../../MobileTopBar'
import { SideNavigation } from '../../SideNavigation'

const MainWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginLeft: 280, // Make room for side navigation
  },
}))

const ContainerStyled = styled(Container)(({ theme }) => ({
  [`&.${containerClasses.root}`]: {
    marginBottom: '130px',
    marginTop: '20px',

    [theme.breakpoints.down('md')]: {
      marginTop: '76px',
    },
  },
}))

export const AuthenticatedContainerOutlet = () => {
  const { data: user } = useUserProfileCurrentUserQuery(undefined, {
    select: d => unwrapResult(d.currentUser, 'User'),
  })
  const theme = useTheme()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { shouldShowPrompt, handlePromptClosed } = useProfilePicturePrompt()

  useEffect(() => {
    if (user) {
      dispatch(
        setUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday ?? undefined,
          pictureUrl: user.pictureUrl ?? undefined,
          social: user.socials ?? [],
        }),
      )
    }
  }, [user, dispatch])

  return (
    <>
      <SideNavigation />

      {isMobile && <MobileTopBar />}

      <MainWrapper as="main">
        <ContainerStyled fixed maxWidth="lg">
          <Outlet />
        </ContainerStyled>
      </MainWrapper>

      {isMobile && <MobileBottomNavigation />}

      {/* Profile Picture Suggestion Modal */}
      <ProfilePicturePromptModal open={shouldShowPrompt} onClose={() => handlePromptClosed()} />
    </>
  )
}
