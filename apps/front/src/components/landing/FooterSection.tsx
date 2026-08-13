import { Container, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import { landingTokens } from './landing.tokens'

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: landingTokens.deepBlue,
  padding: theme.spacing(2.5, 0),
}))

const FooterContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
}))

const Copyright = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.55)',
  fontSize: '0.85rem',
}))

const FooterLinkItem = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.65)',
  fontSize: '0.85rem',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: 'white',
  },
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
  },
}))

export const FooterSection = () => {
  return (
    <FooterContainer>
      <FooterContent maxWidth="lg">
        <Copyright>© {new Date().getFullYear()} Wishlist. Tous droits réservés.</Copyright>

        <Stack direction="row" spacing={3}>
          <FooterLinkItem>
            <Link to="/privacy">Confidentialité</Link>
          </FooterLinkItem>
          <FooterLinkItem>
            <Link to="/terms">Conditions</Link>
          </FooterLinkItem>
        </Stack>
      </FooterContent>
    </FooterContainer>
  )
}
