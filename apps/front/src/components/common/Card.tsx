import type { SxProps, Theme } from '@mui/material/styles'
import type { PropsWithChildren } from 'react'

import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'
import clsx from 'clsx'
import React from 'react'
import { Link } from 'react-router-dom'

export type CardProps = {
  to?: string
  onClick?: () => void
  className?: string
  sx?: SxProps<Theme>
  variant?: 'outlined' | 'contained'
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    padding: '16px',
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
    },
  },
}))

export const Card = ({ onClick, to, children, className, sx, variant = 'contained' }: PropsWithChildren<CardProps>) => {
  const LinkProps = to ? { component: Link, to } : {}
  const classes = useStyles()

  return (
    <Box
      className={clsx(
        classes.card,
        variant === 'contained' && 'card',
        variant === 'outlined' && 'card-outlined',
        (to || onClick) && 'clickable',
        className,
      )}
      {...LinkProps}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </Box>
  )
}
