import type { RootState } from '../../core'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import LogoSvg from '../../assets/logo/logo.svg?react'
import LogoTextSvg from '../../assets/logo/logo_text.svg?react'
import { closeDrawer } from '../../core/store/features'
import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'

const mapAuthState = (state: RootState) => state.auth
const mapUserProfileState = (state: RootState) => state.userProfile
const mapDrawerState = (state: RootState) => state.drawer

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  zIndex: theme.zIndex.drawer,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '1px 0 4px rgba(0, 0, 0, 0.06), 2px 0 12px rgba(0, 0, 0, 0.03)',
    [theme.breakpoints.up('md')]: {
      borderRight: `1px solid ${theme.palette.grey[200]}`,
    },
    [theme.breakpoints.down('md')]: {
      width: '75vw',
      maxWidth: '320px',
    },
  },
}))

const DrawerContentStyled = styled(Box)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}))

const LogoSectionStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.primary.dark}`,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  gap: 20,
}))

const LogoIconStyled = styled(LogoSvg)(() => ({
  height: 38,
  width: 38,
  color: 'white',
}))

const LogoTextStyled = styled(LogoTextSvg)(() => ({
  height: 60,
  color: 'white',
}))

const MainListStyled = styled(List)(({ theme }) => ({
  flex: 1,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}))

const ListItemStyled = styled(ListItem)(() => ({
  padding: 0,
  marginBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
}))

const ListItemButtonStyled = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  transition: 'all 0.2s ease-in-out',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light + '30',
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light + '50',
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '50',
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}))

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.text.secondary,
}))

const UserSectionStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.spacing(2),
  margin: theme.spacing(0, 2, 0.5, 2),
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '20',
    color: theme.palette.primary.main,
    transform: 'scale(1.02)',
    '& .user-avatar': {
      borderColor: theme.palette.primary.main,
    },
  },
  '&:active': {
    backgroundColor: theme.palette.primary.main + '15',
    transform: 'scale(1.01)',
  },
  // Supprimer le highlight par défaut sur mobile
  WebkitTapHighlightColor: 'transparent',
}))

const UserAvatarStyled = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  border: `2px solid ${theme.palette.grey[300]}`,
  transition: 'all 0.2s ease-in-out',
}))

const UserInfoStyled = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: '4px',
}))

const UserNameStyled = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const UserRoleStyled = styled(Box)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const BottomSectionStyled = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    paddingBottom: '68px',
  },
}))

export const SideNavigation = () => {
  const { user } = useSelector(mapAuthState)
  const { pictureUrl, firstName, email } = useSelector(mapUserProfileState)
  const { isOpen: isDrawerOpen } = useSelector(mapDrawerState)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToast()
  const logout = useLogout()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = useCallback(async () => {
    addToast({ message: 'A bientôt 👋', variant: 'default' })
    await logout()
  }, [addToast, logout])

  const handleNavigation = async (route: string) => {
    if (route === 'logout') {
      await handleLogout()
      return
    }
    navigate(route)
    // Close mobile drawer after navigation
    if (isMobile) {
      dispatch(closeDrawer())
    }
  }

  const handleDrawerClose = () => {
    dispatch(closeDrawer())
  }

  const isRouteActive = (route: string) => {
    const pathname = location.pathname
    if (route === pathname) return true
    // Handle nested routes (e.g., /events/123 should activate /events)
    if (route !== '/' && pathname.startsWith(`${route}/`)) return true
    return false
  }

  const mainMenuItems = [
    {
      label: 'Évènements',
      value: '/events',
      icon: <CalendarMonthIcon />,
    },
    {
      label: 'Mes listes',
      value: '/wishlists',
      icon: <FormatListBulletedIcon />,
    },
  ]

  if (user?.isAdmin) {
    mainMenuItems.push({
      label: 'Admin',
      value: '/admin',
      icon: <AdminPanelSettingsIcon />,
    })
  }

  const bottomMenuItems = [
    {
      label: 'Mon profil',
      value: '/user/profile',
      icon: pictureUrl ? <Avatar src={pictureUrl} sx={{ height: '24px', width: '24px' }} /> : <PersonIcon />,
    },
    {
      label: 'Déconnexion',
      value: 'logout',
      icon: <LogoutIcon />,
    },
  ]

  const drawerContent = (
    <DrawerContentStyled>
      <LogoSectionStyled onClick={() => navigate('/')}>
        <LogoIconStyled />
        <LogoTextStyled />
      </LogoSectionStyled>

      {/* Main navigation items */}
      <MainListStyled>
        {mainMenuItems.map(item => (
          <ListItemStyled key={item.value} disablePadding>
            <ListItemButtonStyled selected={isRouteActive(item.value)} onClick={() => handleNavigation(item.value)}>
              <ListItemIconStyled
                sx={{
                  color: isRouteActive(item.value) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIconStyled>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    style: {
                      fontSize: '0.95rem',
                      fontWeight: isRouteActive(item.value) ? 600 : 400,
                    },
                  },
                }}
              />
            </ListItemButtonStyled>
          </ListItemStyled>
        ))}
      </MainListStyled>

      {/* Bottom section - Profile and Logout */}
      <BottomSectionStyled>
        {/* User section in bottom */}
        <UserSectionStyled onClick={() => handleNavigation('/user/profile')}>
          <UserAvatarStyled className="user-avatar" src={pictureUrl || undefined}>
            {!pictureUrl && <PersonIcon />}
          </UserAvatarStyled>
          <UserInfoStyled>
            <UserNameStyled>{firstName}</UserNameStyled>
            <UserRoleStyled>{email}</UserRoleStyled>
          </UserInfoStyled>
        </UserSectionStyled>

        {/* Logout only */}
        {bottomMenuItems.slice(1).map(item => (
          <ListItemStyled key={item.value} disablePadding>
            <ListItemButtonStyled selected={isRouteActive(item.value)} onClick={() => handleNavigation(item.value)}>
              <ListItemIconStyled
                sx={{
                  color: isRouteActive(item.value) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIconStyled>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    style: {
                      fontSize: '0.95rem',
                      fontWeight: isRouteActive(item.value) ? 600 : 400,
                    },
                  },
                }}
              />
            </ListItemButtonStyled>
          </ListItemStyled>
        ))}
      </BottomSectionStyled>
    </DrawerContentStyled>
  )

  return (
    <DrawerStyled
      variant={isMobile ? 'temporary' : 'permanent'}
      anchor="left"
      open={isMobile ? isDrawerOpen : true}
      onClose={isMobile ? handleDrawerClose : undefined}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
    >
      {drawerContent}
    </DrawerStyled>
  )
}
