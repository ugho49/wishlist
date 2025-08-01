/// <reference types="vite-plugin-svgr/client" />
import { Box, Container, Stack, styled } from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'

import { Logo } from '../Logo'

const Root = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  paddingBlock: theme.spacing(4),
}))

const LogoContainer = styled(Box)({
  cursor: 'pointer',
  color: 'primary.main',
  '&:hover': {
    opacity: 0.8,
  },
})

const OutletContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'white',
  borderRadius: theme.spacing(3),
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  padding: theme.spacing(4),
}))

export const AnonymousRouteContainerOutlet = () => {
  const navigate = useNavigate()

  return (
    <Root>
      <Container component="main" maxWidth="sm">
        <Stack direction="column" alignItems="center" spacing={4}>
          <LogoContainer onClick={() => navigate('/')}>
            {/* TODO: use svg */}
            <Logo height={48} variant="full" />
          </LogoContainer>

          <OutletContainer>
            <Outlet />
          </OutletContainer>
        </Stack>
      </Container>
    </Root>
  )
}
