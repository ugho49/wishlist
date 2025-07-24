import type { ButtonProps } from '@mui/material'
import type { LinkProps } from 'react-router-dom'

import { Box, Button, Container, Typography } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'

import { Logo } from '../common/Logo'

// Animations
const twinkle = keyframes`
  0%, 100% { 
    opacity: 0.2;
    transform: scale(0.8);
    filter: brightness(0.8);
  }
  50% { 
    opacity: 1;
    transform: scale(1.5);
    filter: brightness(1.5);
  }
`

const shimmer = keyframes`
  0% { 
    opacity: 0.4;
    filter: brightness(1);
  }
  50% { 
    opacity: 1;
    filter: brightness(2);
  }
  100% { 
    opacity: 0.4;
    filter: brightness(1);
  }
`

const colorShift = keyframes`
  0%, 100% {
    filter: hue-rotate(0deg) brightness(1) saturate(1);
  }
  25% {
    filter: hue-rotate(-3deg) brightness(1.05) saturate(1.1);
  }
  50% {
    filter: hue-rotate(3deg) brightness(0.95) saturate(0.95);
  }
  75% {
    filter: hue-rotate(-2deg) brightness(1.02) saturate(1.05);
  }
`

const HeroContainer = styled(Box)(() => ({
  background: `linear-gradient(135deg, #1a3a52 0%, #255376 50%, #1a3a52 100%)`,
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  animation: `${colorShift} 10s ease-in-out infinite`,
}))

// Animated Star Points
const StarPoint = styled(Box)(() => ({
  position: 'absolute',
  width: '2px',
  height: '2px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  pointerEvents: 'none',
  boxShadow: '0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(147, 197, 253, 0.8)',
  animation: `${twinkle} 1.5s ease-in-out infinite`,
}))

const BiggerStar = styled(Box)(() => ({
  position: 'absolute',
  width: '3px',
  height: '3px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  pointerEvents: 'none',
  boxShadow: '0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(147, 197, 253, 1)',
  animation: `${shimmer} 1s ease-in-out infinite`,
}))

const ContentWrapper = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gridTemplateColumns: '1fr 400px',
  gap: theme.spacing(8),
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
    textAlign: 'center',
  },
}))

const MainContent = styled(Box)(() => ({
  color: 'white',
}))

const GradientTitle = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '3.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}))

const Subtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1.25rem',
  lineHeight: 1.6,
  marginBottom: theme.spacing(4),
  maxWidth: '500px',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
    maxWidth: 'none',
  },
}))

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(6),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}))

const PrimaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  backgroundColor: 'white',
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}))

const SecondaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  borderColor: 'white',
  color: 'white',
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'white',
    transform: 'translateY(-2px)',
  },
}))

const FeaturesSidebar = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('md')]: {
    margin: '0 auto',
    maxWidth: '400px',
  },
}))

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '&:last-child': {
    marginBottom: 0,
  },
}))

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: 'white',
}))

const FeatureContent = styled(Box)(() => ({
  flex: 1,
}))

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}))

const FeatureDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}))

const NavBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 2,
  padding: theme.spacing(2, 0),
}))

const NavContent = styled(Container)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}))

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const NavLink = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.9)',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    color: 'white',
  },
}))

const handleSmoothScroll = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const LoginButton = styled(Button)<ButtonProps & LinkProps>(() => ({
  color: 'white',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  fontWeight: 500,
  '&:hover': {
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}))

const features = [
  {
    icon: '📅',
    title: 'Événements organisés',
    description: 'Créez des événements pour toutes vos célébrations et invitez vos proches facilement.',
    bgColor: '#f59e0b',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Partage en famille',
    description: 'Partagez vos listes de souhaits avec famille et amis pour des surprises réussies.',
    bgColor: '#10b981',
  },
  {
    icon: '✨',
    title: 'Expérience magique',
    description: 'Interface intuitive et design élégant pour une expérience utilisateur exceptionnelle.',
    bgColor: '#8b5cf6',
  },
]

export const HeroSection = () => {
  // Generate star positions
  const smallStars = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
  }))

  const bigStars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 1,
  }))

  return (
    <HeroContainer>
      {/* Small twinkling stars */}
      {smallStars.map(star => (
        <StarPoint
          key={`small-${star.id}`}
          sx={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Bigger shimmering stars */}
      {bigStars.map(star => (
        <BiggerStar
          key={`big-${star.id}`}
          sx={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <NavBar>
        <NavContent maxWidth="lg">
          <Logo variant="full" color="white" />
          <NavLinks>
            <NavLink onClick={() => handleSmoothScroll('features')}>Fonctionnalités</NavLink>
            <NavLink onClick={() => handleSmoothScroll('faq')}>FAQ</NavLink>
          </NavLinks>
          <LoginButton variant="outlined" component={Link} to="/login">
            Connexion
          </LoginButton>
        </NavContent>
      </NavBar>

      <ContentWrapper maxWidth="lg">
        <MainContent>
          <GradientTitle variant="h1">
            Organisez vos
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #dbeafe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(147, 197, 253, 0.8)',
              }}
            >
              moments magiques
            </span>
          </GradientTitle>

          <Subtitle>
            Partagez vos souhaits avec vos proches et découvrez leurs envies. Parfait pour les anniversaires, Noël,
            mariages et plus encore.
          </Subtitle>

          <ButtonGroup>
            <PrimaryButton variant="contained" size="large" component={Link} to="/register">
              Créer ma première liste
            </PrimaryButton>
            <SecondaryButton variant="outlined" size="large" component={Link} to="/login">
              Découvrir
            </SecondaryButton>
          </ButtonGroup>
        </MainContent>

        <FeaturesSidebar>
          {features.map((feature, index) => (
            <FeatureItem key={index}>
              <FeatureIcon style={{ backgroundColor: feature.bgColor }}>{feature.icon}</FeatureIcon>
              <FeatureContent>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureContent>
            </FeatureItem>
          ))}
        </FeaturesSidebar>
      </ContentWrapper>
    </HeroContainer>
  )
}
