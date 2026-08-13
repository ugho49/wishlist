import { Box, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { landingTokens } from './landing.tokens'

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(14, 0),
  backgroundColor: landingTokens.paper,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 0),
  },
}))

const SectionHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  maxWidth: 560,
  margin: `0 auto ${theme.spacing(8)}`,
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

const SectionTitle = styled(Typography)(() => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: landingTokens.ink,
}))

const StepsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(6),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
    maxWidth: 480,
    margin: '0 auto',
  },
}))

const Step = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${landingTokens.hairline}`,
  paddingTop: theme.spacing(3),
}))

const StepNumber = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontStyle: 'italic',
  fontSize: '1.5rem',
  color: landingTokens.accent,
  marginBottom: theme.spacing(1.5),
}))

const StepTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.15rem',
  color: landingTokens.ink,
  marginBottom: theme.spacing(1),
}))

const StepDescription = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  lineHeight: 1.7,
  fontSize: '0.95rem',
}))

const steps = [
  {
    number: '01',
    title: 'Créez votre événement',
    description: 'Choisissez l’occasion et la date, puis invitez vos proches par email ou en partageant un lien.',
  },
  {
    number: '02',
    title: 'Partagez vos listes',
    description: 'Chacun renseigne ses envies : un lien, une photo, une priorité. Tout le monde sait quoi offrir.',
  },
  {
    number: '03',
    title: 'Réservez en toute discrétion',
    description: 'Les invités réservent les cadeaux entre eux pour éviter les doublons. La surprise reste entière.',
  },
]

export const HowItWorksSection = () => {
  return (
    <SectionContainer id="how-it-works">
      <Container maxWidth="lg">
        <SectionHeader>
          <Kicker>Comment ça marche</Kicker>
          <SectionTitle>Trois étapes, zéro doublon.</SectionTitle>
        </SectionHeader>

        <StepsGrid>
          {steps.map(step => (
            <Step key={step.number}>
              <StepNumber>{step.number}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Step>
          ))}
        </StepsGrid>
      </Container>
    </SectionContainer>
  )
}
