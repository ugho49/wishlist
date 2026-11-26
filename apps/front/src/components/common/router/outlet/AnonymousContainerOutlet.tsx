import { Box, Container, GlobalStyles, Stack, styled, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate } from '@tanstack/react-router';

import { navyBackdrop } from '../../../../theme';
import { Card } from '../../Card';
import { Logo } from '../../Logo';

const Root = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  paddingBlock: theme.spacing(4),
  background: navyBackdrop(theme),
}));

const LogoContainer = styled(Box)({
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
});

const OutletContainer = styled(Card)(() => ({
  borderRadius: 24,
  padding: 32,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2) !important',
}));

export const AnonymousContainerOutlet = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  return (
    <Root>
      {/* Navy overscroll and canvas behind the navy page instead of the light app background */}
      <GlobalStyles styles={{ html: { backgroundColor: theme.palette.primary.dark } }} />
      <Container component="main" maxWidth="sm">
        <Stack
          direction="column"
          spacing={4}
          sx={{
            alignItems: 'center',
          }}
        >
          <LogoContainer onClick={() => navigate({ to: '/' })}>
            <Logo height={isSmallScreen ? 80 : 120} />
          </LogoContainer>

          <OutletContainer>
            <Outlet />
          </OutletContainer>
        </Stack>
      </Container>
    </Root>
  );
};
