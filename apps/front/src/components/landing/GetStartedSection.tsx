import type { ButtonProps } from '@mui/material'
import type { LinkProps } from 'react-router-dom'

import { Box, Button, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'

const CTAContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(10deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 60%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(12, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M20 20c0-16.569-13.431-30-30-30s-30 13.431-30 30 13.431 30 30 30 30-13.431 30-30z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  },
}))

const ContentWrapper = styled(Container)(() => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  color: 'white',
}))

const CTATitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}))

const CTASubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  color: 'rgba(255, 255, 255, 0.9)',
  maxWidth: '600px',
  margin: `0 auto ${theme.spacing(8)}`,
  lineHeight: 1.6,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
    margin: `0 auto ${theme.spacing(6)}`,
  },
}))

const ButtonGroup = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}))

const PrimaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  backgroundColor: 'white',
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(2, 5),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  minWidth: 220,
  '&:hover': {
    backgroundColor: '#f8fafc',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}))

const FloatingCard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const FloatingCard1 = styled(FloatingCard)(() => ({
  top: '20%',
  left: '10%',
  transform: 'rotate(-5deg)',
}))

const FloatingCard2 = styled(FloatingCard)(() => ({
  top: '60%',
  right: '10%',
  transform: 'rotate(5deg)',
}))

const FloatingCard3 = styled(FloatingCard)(() => ({
  bottom: '20%',
  left: '15%',
  transform: 'rotate(-3deg)',
}))

const FloatingCard4 = styled(FloatingCard)(() => ({
  top: '40%',
  right: '15%',
  transform: 'rotate(-7deg)',
}))

const CardIcon = styled(Box)(() => ({
  fontSize: '2rem',
  marginBottom: '8px',
  textAlign: 'center',
}))

const CardText = styled(Typography)(() => ({
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.9)',
  textAlign: 'center',
  fontWeight: 500,
}))

export const GetStartedSection = () => {
  return (
    <CTAContainer>
      <FloatingCard1>
        <CardIcon>🎂</CardIcon>
        <CardText>Anniversaires</CardText>
      </FloatingCard1>

      <FloatingCard2>
        <CardIcon>🎄</CardIcon>
        <CardText>Noël</CardText>
      </FloatingCard2>

      <FloatingCard3>
        <CardIcon>💍</CardIcon>
        <CardText>Mariages</CardText>
      </FloatingCard3>

      <FloatingCard4>
        <CardIcon>👶</CardIcon>
        <CardText>Naissance</CardText>
      </FloatingCard4>

      <ContentWrapper maxWidth="md">
        <CTATitle>Prêt à créer vos premières listes ?</CTATitle>

        <CTASubtitle>
          Rejoignez des milliers de familles qui utilisent déjà WishList pour organiser leurs moments les plus précieux.
        </CTASubtitle>

        <ButtonGroup>
          <PrimaryButton variant="contained" size="large" component={Link} to="/register">
            Commencer gratuitement
          </PrimaryButton>
        </ButtonGroup>
      </ContentWrapper>
    </CTAContainer>
  )
}
