import { Box, Container, Stack, styled } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'

import { CardV2 } from '../../CardV2'
import { Logo } from '../../Logo'

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

const OutletContainer = styled(CardV2)(() => ({
  borderRadius: 24,
  padding: 32,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important',
}))

interface AnonymousContainerOutletProps {
  children: React.ReactNode
}

export const AnonymousContainerOutlet = ({ children }: AnonymousContainerOutletProps) => {
  const navigate = useNavigate()

  return (
    <Root>
      <Container component="main" maxWidth="sm">
        <Stack direction="column" alignItems="center" spacing={4}>
          <LogoContainer onClick={() => navigate({ to: '/' })}>
            <Logo height={48} variant="full" />
          </LogoContainer>

          <OutletContainer>{children}</OutletContainer>
        </Stack>
      </Container>
    </Root>
  )
}
