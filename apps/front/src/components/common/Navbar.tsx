/// <reference types="vite-plugin-svgr/client" />
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutIcon from '@mui/icons-material/Logout'
import { AppBar, Box, Button, Container, IconButton, Stack, styled, Toolbar, Typography } from '@mui/material'
import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import IconSvg from '../../assets/icons/icon.svg?react'
import TextSvg from '../../assets/icons/logo_text.svg?react'
import { useHistoryStack } from '../../hooks/useHistoryStack'
import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'

const Logo = styled(Stack)(({ theme }) => ({
  flexGrow: 1,
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
  },
}))

const LogoLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.secondary.main,
}))

const LeftNavbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexBasis: '20%',
  marginLeft: '-15px',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}))

const GoBack = () => {
  const navigate = useNavigate()
  const { history } = useHistoryStack()

  if (history.length === 0) {
    return null
  }

  return (
    <IconButton color="inherit" onClick={() => navigate(-1)}>
      <ArrowBackIcon />
    </IconButton>
  )
}

export const Navbar = () => {
  const { addToast } = useToast()
  const logout = useLogout()

  const handleLogout = useCallback(async () => {
    addToast({ message: 'A bientôt 👋', variant: 'default' })
    await logout()
  }, [addToast, logout])

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar>
          <LeftNavbar>
            <GoBack />
          </LeftNavbar>

          <Logo alignItems="center" direction="row">
            <LogoLink to="/">
              <IconSvg style={{ marginRight: '10px', height: '24px' }} />
              <TextSvg style={{ height: '44px' }} />
            </LogoLink>
          </Logo>

          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              <Typography variant="inherit">Déconnexion</Typography>
            </Button>
          </Box>

          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              flexBasis: '20%',
              marginRight: '-15px',
              justifyContent: 'flex-end',
            }}
          >
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
