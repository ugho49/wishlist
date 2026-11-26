import { Box, Container, Stack, styled, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate } from '@tanstack/react-router';

import { Card } from '../../Card';
import { Logo } from '../../Logo';

const Root = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  paddingBlock: theme.spacing(4),
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
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important',
}));

export const AnonymousContainerOutlet = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  return (
    <Root>
      <Container component="main" maxWidth="sm">
        <Stack
          direction="column"
          spacing={4}
          sx={{
            alignItems: 'center',
          }}
        >
          <LogoContainer onClick={() => navigate({ to: '/' })}>
            <Logo tone="light" height={isSmallScreen ? 72 : 100} />
          </LogoContainer>

          <OutletContainer>
            <Outlet />
          </OutletContainer>
        </Stack>
      </Container>
    </Root>
  );
};
