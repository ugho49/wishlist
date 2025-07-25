import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AppBar, Box, IconButton, styled, Toolbar } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

import LogoTextSvg from '../../assets/logo/logo_text.svg?react'
import { useHistoryStack } from '../../hooks'

const AppBarStyled = styled(AppBar)(({ theme }) => ({
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
  position: 'relative',
  padding: 0,
}))

const BackButtonStyled = styled(IconButton)<{ canGoBack: boolean }>(({ canGoBack }) => ({
  position: 'absolute',
  left: 24,
  top: '50%',
  transform: canGoBack ? 'translateY(-50%)' : 'translateY(-50%) translateX(-100px)',
  opacity: canGoBack ? 1 : 0,
  pointerEvents: canGoBack ? 'auto' : 'none',
  color: 'white',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1,
}))

const LogoContainerStyled = styled(Box)(() => ({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  cursor: 'pointer',
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
        <BackButtonStyled
          canGoBack={canGoBack}
          color="inherit"
          aria-label="go back"
          edge="start"
          onClick={handleGoBack}
        >
          <ArrowBackIcon />
        </BackButtonStyled>

        <LogoContainerStyled onClick={() => navigate('/')}>
          <LogoSvgStyled />
        </LogoContainerStyled>
      </ToolbarStyled>
    </AppBarStyled>
  )
}
