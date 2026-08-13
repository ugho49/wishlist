import type { ButtonProps } from '@mui/material'
import type { LinkProps } from '@tanstack/react-router'

import { Box, Button, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import { landingTokens } from './landing.tokens'

const CTAContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(175deg, ${theme.palette.primary.main} 0%, ${landingTokens.deepBlue} 75%)`,
  padding: theme.spacing(14, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-40%',
    right: '-10%',
    width: '50%',
    height: '120%',
    background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 0),
  },
}))

const ContentWrapper = styled(Container)(() => ({
  position: 'relative',
  textAlign: 'center',
}))

const CTATitle = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  color: '#ffffff',
  marginBottom: theme.spacing(2.5),
  '& em': {
    fontStyle: 'italic',
    color: '#cfe3f3',
  },
}))

const CTASubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.85)',
  maxWidth: 520,
  margin: `0 auto ${theme.spacing(6)}`,
  lineHeight: 1.7,
}))

const PrimaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.05rem',
  padding: theme.spacing(1.75, 5),
  boxShadow: '0 16px 32px -16px rgba(0, 0, 0, 0.4)',
  '&:hover': {
    backgroundColor: landingTokens.paper,
    transform: 'translateY(-1px)',
    boxShadow: '0 20px 36px -16px rgba(0, 0, 0, 0.45)',
  },
}))

const TrustCaption = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.7)',
}))

export const GetStartedSection = () => {
  return (
    <CTAContainer>
      <ContentWrapper maxWidth="md">
        <CTATitle>
          Prêt pour votre <em>prochain</em> événement ?
        </CTATitle>

        <CTASubtitle>
          Rejoignez les familles qui utilisent déjà Wishlist pour organiser leurs moments les plus précieux.
        </CTASubtitle>

        <PrimaryButton variant="contained" size="large" component={Link} to="/register">
          Commencer gratuitement
        </PrimaryButton>

        <TrustCaption>Inscription en moins d’une minute · 100 % gratuit</TrustCaption>
      </ContentWrapper>
    </CTAContainer>
  )
}
