import { RedeemRounded, ShuffleRounded, VisibilityOffRounded } from '@mui/icons-material'
import { Box, styled, Typography } from '@mui/material'
import { Outlet, useNavigate } from '@tanstack/react-router'

import { landingTokens } from '../../../landing/landing.tokens'
import { Logo } from '../../Logo'

const Root = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}))

const BrandPanel = styled(Box)(({ theme }) => ({
  background: `linear-gradient(175deg, ${theme.palette.primary.main} 0%, ${landingTokens.deepBlue} 85%)`,
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(6, 8),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: '70%',
    height: '80%',
    background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(5, 6),
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const LogoContainer = styled(Box)(() => ({
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 0.85,
  },
}))

const BrandContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  maxWidth: 440,
  paddingBottom: theme.spacing(6),
}))

const BrandHeadline = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(2rem, 2.8vw, 2.7rem)',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  marginBottom: theme.spacing(5),
  '& em': {
    fontStyle: 'italic',
    color: '#cfe3f3',
  },
}))

const BenefitItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing(2.5),
  },
}))

const BenefitIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1.25),
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
}))

const BenefitText = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '0.95rem',
  lineHeight: 1.5,
}))

const BrandFooter = styled(Typography)(() => ({
  position: 'relative',
  color: 'rgba(255, 255, 255, 0.45)',
  fontSize: '0.85rem',
}))

const FormPanel = styled('main')(({ theme }) => ({
  backgroundColor: landingTokens.surface,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
}))

const FormColumn = styled(Box)(() => ({
  width: '100%',
  maxWidth: 420,
}))

const MobileLogo = styled(Box)(({ theme }) => ({
  display: 'none',
  cursor: 'pointer',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(5),
  },
}))

const benefits = [
  { icon: <RedeemRounded />, text: 'Créez vos listes de souhaits et partagez-les avec vos proches.' },
  { icon: <VisibilityOffRounded />, text: 'Réservez les cadeaux en toute discrétion, sans doublon.' },
  { icon: <ShuffleRounded />, text: 'Organisez un Secret Santa en quelques clics.' },
]

export const AnonymousContainerOutlet = () => {
  const navigate = useNavigate()

  return (
    <Root>
      <BrandPanel>
        <LogoContainer onClick={() => navigate({ to: '/' })}>
          <Logo height={40} variant="full" color="white" />
        </LogoContainer>

        <BrandContent>
          <BrandHeadline>
            Le bon cadeau,
            <br />à <em>chaque</em> occasion.
          </BrandHeadline>

          <Box>
            {benefits.map(benefit => (
              <BenefitItem key={benefit.text}>
                <BenefitIcon>{benefit.icon}</BenefitIcon>
                <BenefitText>{benefit.text}</BenefitText>
              </BenefitItem>
            ))}
          </Box>
        </BrandContent>

        <BrandFooter>© {new Date().getFullYear()} Wishlist. Tous droits réservés.</BrandFooter>
      </BrandPanel>

      <FormPanel>
        <FormColumn>
          <MobileLogo onClick={() => navigate({ to: '/' })}>
            <Logo height={44} variant="full" />
          </MobileLogo>

          <Outlet />
        </FormColumn>
      </FormPanel>
    </Root>
  )
}
