import { Box, Container, containerClasses, styled, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setUser } from '../../../../core/store/features/userProfileSlice';
import { useUserProfileCurrentUserQuery } from '../../../../gql';
import { useExpireSessionOnUnauthorized } from '../../../../hooks/useExpireSessionOnUnauthorized';
import { useProfilePicturePrompt } from '../../../../hooks/useProfilePicturePrompt';
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
  const currentUserQuery = useUserProfileCurrentUserQuery(undefined, { select: d => d.currentUser });
  const { data } = currentUserQuery;
  const user = data?.__typename === 'CurrentUser' ? data : undefined;
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { shouldShowPrompt, handlePromptClosed } = useProfilePicturePrompt();

  // A rejected token leaves the layout half logged in: end the session instead.
  useExpireSessionOnUnauthorized(currentUserQuery);

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
        {isAdminRoute ? (
          <Outlet />
        ) : (
          <ContainerStyled fixed maxWidth="lg">
            <Outlet />
          </ContainerStyled>
        )}
      </MainWrapper>

      {isMobile && <MobileBottomNavigation />}

      {/* Profile Picture Suggestion Modal */}
      <ProfilePicturePromptModal open={shouldShowPrompt} onClose={() => handlePromptClosed()} />
    </>
  );
};
