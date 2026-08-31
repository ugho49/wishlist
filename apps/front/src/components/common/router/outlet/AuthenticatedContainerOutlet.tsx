import { Box, Container, containerClasses, styled, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { setUser } from '../../../../core/store/features/userProfileSlice';
import { useUserProfileCurrentUserQuery } from '../../../../gql';
import { useLogout } from '../../../../hooks/useLogout';
import { useProfilePicturePrompt } from '../../../../hooks/useProfilePicturePrompt';
import { useToast } from '../../../../hooks/useToast';
import { ProfilePicturePromptModal } from '../../../user/ProfilePicturePromptModal';
import { MobileBottomNavigation } from '../../MobileBottomNavigation';
import { MobileTopBar } from '../../MobileTopBar';
import { SideNavigation } from '../../SideNavigation';

const MainWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginLeft: 280, // Make room for side navigation
  },
}));

const ContainerStyled = styled(Container)(({ theme }) => ({
  [`&.${containerClasses.root}`]: {
    marginBottom: '130px',
    marginTop: '20px',

    [theme.breakpoints.down('md')]: {
      marginTop: '76px',
    },
  },
}));

export const AuthenticatedContainerOutlet = () => {
  const { data } = useUserProfileCurrentUserQuery(undefined, { select: d => d.currentUser });
  const user = data?.__typename === 'User' ? data : undefined;
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { shouldShowPrompt, handlePromptClosed } = useProfilePicturePrompt();
  const { addToast } = useToast();
  const logout = useLogout();
  const sessionInvalidatedRef = useRef(false);

  // An UnauthorizedRejection here means the stored token is no longer valid:
  // end the session instead of leaving the layout in a half-logged-in state.
  useEffect(() => {
    if (data?.__typename === 'UnauthorizedRejection' && !sessionInvalidatedRef.current) {
      sessionInvalidatedRef.current = true;
      addToast({ message: 'Votre session a expiré, veuillez vous reconnecter', variant: 'warning' });
      void logout();
    }
  }, [data, addToast, logout]);

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
          accounts: user.accounts ?? [],
        }),
      );
    }
  }, [user, dispatch]);

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
  );
};
