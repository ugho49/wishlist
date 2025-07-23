import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AppBar, Box, IconButton, styled, Toolbar } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

import LogoTextSvg from '../../assets/logo/logo_text.svg?react'
import { useHistoryStack } from '../../hooks'

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  display: 'block',
  backgroundColor: theme.palette.primary.main,
  borderBottom: `1px solid ${theme.palette.primary.dark}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  color: 'white',
  zIndex: theme.zIndex.drawer - 2,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

const ToolbarStyled = styled(Toolbar)(() => ({
  height: 56,
  minHeight: '56px !important',
  paddingLeft: 16,
  paddingRight: 16,
}))

const BackButtonStyled = styled(IconButton)(() => ({
  marginRight: 16,
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}))

const LogoContainerStyled = styled(Box)<{ canGoBack: boolean }>(({ canGoBack }) => ({
  flexGrow: 1,
  display: 'flex',
  justifyContent: canGoBack ? 'flex-start' : 'center',
}))

const LogoSvgStyled = styled(LogoTextSvg)(() => ({
  height: 50,
  color: 'white',
}))

export const MobileTopBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { history } = useHistoryStack()

  // Simple logic: show back button if we're not on main routes
  const isMainRoute = ['/', '/events', '/wishlists', '/admin', '/user/profile'].includes(location.pathname)
  const canGoBack = history.length > 0 && !isMainRoute

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <AppBarStyled position="fixed">
      <ToolbarStyled>
        {canGoBack && (
          <BackButtonStyled color="inherit" aria-label="go back" edge="start" onClick={handleGoBack}>
            <ArrowBackIcon />
          </BackButtonStyled>
        )}

        <LogoContainerStyled canGoBack={canGoBack}>
          <LogoSvgStyled />
        </LogoContainerStyled>
      </ToolbarStyled>
    </AppBarStyled>
  )
}
