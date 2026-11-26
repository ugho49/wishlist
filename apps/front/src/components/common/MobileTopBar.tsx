import { AppBar, Box, styled, Toolbar } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { Logo } from './Logo';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderBottom: `1px solid ${theme.palette.primary.dark}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  color: 'white',
  zIndex: theme.zIndex.drawer - 2,
}));

const ToolbarStyled = styled(Toolbar)(() => ({
  height: 56,
  minHeight: '56px !important',
  position: 'relative',
  padding: 0,
}));

const LogoContainerStyled = styled(Box)(() => ({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
}));

export const MobileTopBar = () => {
  const navigate = useNavigate();

  return (
    <AppBarStyled position="fixed">
      <ToolbarStyled>
        <LogoContainerStyled onClick={() => navigate({ to: '/' })}>
          <Logo variant="wordmark" height={28} />
        </LogoContainerStyled>
      </ToolbarStyled>
    </AppBarStyled>
  );
};
