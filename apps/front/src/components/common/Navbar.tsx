/// <reference types="vite-plugin-svgr/client" />
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutIcon from '@mui/icons-material/Logout'
import { AppBar, Box, Button, Container, IconButton, Stack, Theme, Toolbar, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import IconSvg from '../../assets/icons/icon.svg?react'
import TextSvg from '../../assets/icons/logo_text.svg?react'
import { useHistoryStack } from '../../hooks/useHistoryStack'
import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.secondary.main,
  },
  leftNavbar: {
    display: 'flex',
    flexBasis: '20%',
    marginLeft: '-15px',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
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
  const classes = useStyles()
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
          <Box className={classes.leftNavbar}>
            <GoBack />
          </Box>

          <Stack alignItems="center" direction="row" className={classes.logo}>
            <Link to="/" className={classes.logoLink}>
              <IconSvg style={{ marginRight: '10px', height: '24px' }} />
              <TextSvg style={{ height: '44px' }} />
            </Link>
          </Stack>

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
