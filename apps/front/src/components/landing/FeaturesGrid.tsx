import type { SvgIconComponent } from '@mui/icons-material'

import {
  CalendarMonthRounded,
  Diversity3Rounded,
  LockOutlined,
  RedeemRounded,
  ShuffleRounded,
  TaskAltRounded,
} from '@mui/icons-material'
import { Box, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { landingTokens } from './landing.tokens'

const FeaturesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(14, 0),
  backgroundColor: landingTokens.surface,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 0),
  },
}))

const SectionHeader = styled(Box)(({ theme }) => ({
  maxWidth: 560,
  marginBottom: theme.spacing(8),
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(6),
  },
}))

const Kicker = styled(Typography)(({ theme }) => ({
  color: landingTokens.accent,
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(2),
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: landingTokens.ink,
  marginBottom: theme.spacing(2),
}))

const SectionSubtitle = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  fontSize: '1.05rem',
  lineHeight: 1.7,
}))

const FeaturesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}))

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: landingTokens.paper,
  border: `1px solid ${landingTokens.hairline}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 32px -20px rgba(28, 43, 54, 0.25)',
  },
}))

const FeatureIconWrapper = styled(Box)(({ theme }) => ({
  width: 46,
  height: 46,
  borderRadius: theme.spacing(1.5),
  backgroundColor: landingTokens.blueTint,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}))

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  color: landingTokens.ink,
  marginBottom: theme.spacing(1),
}))

const FeatureDescription = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  lineHeight: 1.65,
  fontSize: '0.95rem',
}))

interface Feature {
  icon: SvgIconComponent
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: RedeemRounded,
    title: 'Listes de souhaits',
    description: 'Ajoutez vos envies en quelques secondes, avec un lien, une photo et un niveau de priorité.',
  },
  {
    icon: CalendarMonthRounded,
    title: 'Événements',
    description: 'Anniversaires, Noël, mariages, naissances : réunissez vos proches autour d’une même date.',
  },
  {
    icon: Diversity3Rounded,
    title: 'Partage en famille',
    description: 'Invitez famille et amis par email ou par lien. Chacun consulte les listes des autres.',
  },
  {
    icon: TaskAltRounded,
    title: 'Réservations discrètes',
    description: 'Réservez un cadeau pour éviter les doublons — la personne concernée n’en saura rien.',
  },
  {
    icon: ShuffleRounded,
    title: 'Secret Santa',
    description: 'Tirage au sort automatique avec exclusions et budget. Chacun reçoit son tirage par email.',
  },
  {
    icon: LockOutlined,
    title: 'Confidentialité',
    description: 'Vos listes ne sont visibles que par les personnes que vous invitez, rien de plus.',
  },
]

export const FeaturesGridSection = () => {
  return (
    <FeaturesContainer id="features">
      <Container maxWidth="lg">
        <SectionHeader>
          <Kicker>Fonctionnalités</Kicker>
          <SectionTitle>Tout pour bien offrir, rien de superflu.</SectionTitle>
          <SectionSubtitle>
            Des outils simples pour organiser vos événements et partager vos souhaits, pensés pour toute la famille.
          </SectionSubtitle>
        </SectionHeader>

        <FeaturesGrid>
          {features.map(feature => {
            const Icon = feature.icon
            return (
              <FeatureCard key={feature.title}>
                <FeatureIconWrapper>
                  <Icon fontSize="small" />
                </FeatureIconWrapper>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            )
          })}
        </FeaturesGrid>
      </Container>
    </FeaturesContainer>
  )
}
