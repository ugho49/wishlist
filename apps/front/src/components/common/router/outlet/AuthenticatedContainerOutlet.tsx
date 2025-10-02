import { Box, Container, containerClasses, styled, useMediaQuery, useTheme } from '@mui/material'
import { useFetchUserInfo } from '@wishlist/front-hooks'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setUser } from '../../../../core/store/features'
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

interface AuthenticatedContainerOutletProps {
  children: React.ReactNode
}

export const AuthenticatedContainerOutlet = ({ children }: AuthenticatedContainerOutletProps) => {
  const { user } = useFetchUserInfo()
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
          firstName: user.firstname,
          lastName: user.lastname,
          birthday: user.birthday,
          pictureUrl: user.picture_url,
          social: user.social,
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
          {children}
        </ContainerStyled>
      </MainWrapper>

      {isMobile && <MobileBottomNavigation />}

      {/* Profile Picture Suggestion Modal */}
      <ProfilePicturePromptModal open={shouldShowPrompt} onClose={() => handlePromptClosed()} />
    </>
  )
}
