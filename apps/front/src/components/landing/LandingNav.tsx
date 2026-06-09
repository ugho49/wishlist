import type { ButtonProps } from '@mui/material'
import type { LinkProps } from '@tanstack/react-router'

import { Box, Button, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import { Logo } from '../common/Logo'
import { landingTokens } from './landing.tokens'

const NavBar = styled('nav')(() => ({
  position: 'sticky',
  top: 0,
  zIndex: 20,
  backgroundColor: 'rgba(250, 248, 244, 0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${landingTokens.hairline}`,
}))

const NavContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: theme.spacing(1.75),
  paddingBottom: theme.spacing(1.75),
}))

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}))

const NavLink = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  fontWeight: 500,
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: landingTokens.ink,
  },
}))

const NavActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

const LoginButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  color: landingTokens.ink,
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}))

const RegisterButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  fontWeight: 600,
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
}))

const navItems = [
  { label: 'Fonctionnalités', targetId: 'features' },
  { label: 'Comment ça marche', targetId: 'how-it-works' },
  { label: 'FAQ', targetId: 'faq' },
]

const handleSmoothScroll = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export const LandingNav = () => {
  return (
    <NavBar>
      <NavContent maxWidth="lg">
        <Logo variant="full" height={36} />
        <NavLinks>
          {navItems.map(item => (
            <NavLink key={item.targetId} onClick={() => handleSmoothScroll(item.targetId)}>
              {item.label}
            </NavLink>
          ))}
        </NavLinks>
        <NavActions>
          <LoginButton variant="text" component={Link} to="/login">
            Se connecter
          </LoginButton>
          <RegisterButton variant="contained" disableElevation component={Link} to="/register">
            Commencer
          </RegisterButton>
        </NavActions>
      </NavContent>
    </NavBar>
  )
}
