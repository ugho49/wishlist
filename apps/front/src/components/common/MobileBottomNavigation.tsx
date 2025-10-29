import type { RootState } from '../../core'

import MenuIcon from '@mui/icons-material/Menu'
import { BottomNavigation, BottomNavigationAction, bottomNavigationActionClasses, Paper, styled } from '@mui/material'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux'

import { closeDrawer, toggleDrawer } from '../../core/store/features'

const PaperStyled = styled(Paper)<{ isDrawerOpen: boolean }>(({ theme, isDrawerOpen }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'block',
  zIndex: theme.zIndex.drawer + 1,
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  backdropFilter: 'blur(16px)',
  boxShadow: isDrawerOpen ? 'none' : '0 -1px 4px rgba(0, 0, 0, 0.04), 0 -2px 8px rgba(0, 0, 0, 0.02)',
  borderRadius: 0,
}))

const BottomNavigationStyled = styled(BottomNavigation)(({ theme }) => ({
  position: 'relative',
  '&:hover': {
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.background.default,
  },
  '&:after': {
    content: "''",
    position: 'absolute',
    width: '100%',
    bottom: 0,
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    transform: 'scaleX(0)',
    transition: 'transform 250ms ease-in-out',
  },
  [`&.${bottomNavigationActionClasses.selected}:after`]: {
    transform: 'scaleX(1)',
  },
}))

export const MobileBottomNavigation = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isDrawerOpen = useSelector((state: RootState) => state.drawer.isOpen)

  const getSelectedValue = () => {
    if (isDrawerOpen) return 'menu'
    if (location.pathname.startsWith('/events')) return 'events'
    return ''
  }

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'menu') {
      dispatch(toggleDrawer()) // Toggle drawer via Redux
    } else if (newValue === 'events') {
      // Close drawer if open and navigate to events
      if (isDrawerOpen) {
        dispatch(closeDrawer())
      }
      void navigate({ to: '/events' })
    }
  }

  return (
    <PaperStyled elevation={0} isDrawerOpen={isDrawerOpen}>
      <BottomNavigationStyled value={getSelectedValue()} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Menu" value="menu" icon={<MenuIcon />} />
        {/* <BottomNavigationAction label="Événements" value="events" icon={<CalendarMonthIcon />} /> */}
      </BottomNavigationStyled>
    </PaperStyled>
  )
}
