import { Box, Fab, fabClasses } from '@mui/material'
import { FabTypeMap } from '@mui/material/Fab/Fab'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles } from '@mui/styles'
import React from 'react'

import { RouterLink } from './RouterLink'

const useStyles = makeStyles(() => ({
  fab: {
    [`&.${fabClasses.root}`]: {
      position: 'fixed',
      bottom: 72,
      right: 16,
    },
  },
}))

export type FabAutoGrowProps = {
  to?: string
  onClick?: () => void
  color?: FabTypeMap['props']['color']
  label: string
  icon: React.ReactNode
}

export const FabAutoGrow = ({ to, onClick, label, color, icon }: FabAutoGrowProps) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const classes = useStyles()
  const BaseProps = { onClick, color, className: classes.fab }
  const Props = to ? { ...BaseProps, component: RouterLink, to } : BaseProps

  return (
    <Fab variant="extended" {...Props} size={smallScreen ? 'medium' : 'large'}>
      {icon}
      <Box sx={{ ml: 1 }}>{label}</Box>
    </Fab>
  )
}
