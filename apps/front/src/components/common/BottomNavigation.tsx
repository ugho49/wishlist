import type { Theme } from '@mui/material'

import type { RootState } from '../../core'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import PersonIcon from '@mui/icons-material/Person'
import {
  Avatar,
  BottomNavigationAction,
  bottomNavigationActionClasses,
  BottomNavigation as MuiBottomNavigation,
  Paper,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const mapAuthState = (state: RootState) => state.auth
const mapUserProfileState = (state: RootState) => state.userProfile

const useStyles = makeStyles((theme: Theme) => ({
  bottomNavigationAction: {
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
  },
}))

export const BottomNavigation = () => {
  const classes = useStyles()
  const { user } = useSelector(mapAuthState)
  const { pictureUrl } = useSelector(mapUserProfileState)
  const [currentNavigation, setCurrentNavigation] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
    setCurrentNavigation(newValue)
  }

  useEffect(() => {
    const { pathname } = location
    setCurrentNavigation(pathname)
  }, [location])

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3} component="nav">
      <MuiBottomNavigation showLabels value={currentNavigation} onChange={handleChange}>
        <BottomNavigationAction
          className={classes.bottomNavigationAction}
          label="Évènements"
          value="/events"
          icon={<CalendarMonthIcon />}
        />
        <BottomNavigationAction
          className={classes.bottomNavigationAction}
          label="Mes listes"
          value="/wishlists"
          icon={<FormatListBulletedIcon />}
        />
        {user?.isAdmin && (
          <BottomNavigationAction
            className={classes.bottomNavigationAction}
            label="Admin"
            value="/admin"
            icon={<AdminPanelSettingsIcon />}
          />
        )}
        <BottomNavigationAction
          className={classes.bottomNavigationAction}
          label="Mon profil"
          value="/user/profile"
          icon={pictureUrl ? <Avatar src={pictureUrl} sx={{ height: '24px', width: '24px' }} /> : <PersonIcon />}
        />
      </MuiBottomNavigation>
    </Paper>
  )
}
