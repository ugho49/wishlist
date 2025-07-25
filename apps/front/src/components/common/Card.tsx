import type { SxProps, Theme } from '@mui/material/styles'
import type { PropsWithChildren } from 'react'

import { Box, styled } from '@mui/material'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

export type CardProps = {
  to?: string
  onClick?: () => void
  className?: string
  sx?: SxProps<Theme>
  variant?: 'outlined' | 'contained'
  noPadding?: boolean
  biggerPaddingInDesktop?: boolean
}

const CardStyled = styled(Box)(({ theme }) => ({
  padding: '16px',
  ['&.bigger-padding-in-desktop']: {
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
    },
  },
}))

export const Card = ({
  onClick,
  to,
  children,
  className,
  sx,
  biggerPaddingInDesktop = true,
  variant = 'contained',
  noPadding = false,
}: PropsWithChildren<CardProps>) => {
  const LinkProps = to ? { component: Link, to } : {}

  return (
    <CardStyled
      className={clsx(
        variant === 'contained' && 'card',
        variant === 'outlined' && 'card-outlined',
        (to || onClick) && 'clickable',
        biggerPaddingInDesktop && 'bigger-padding-in-desktop',
        noPadding && 'no-padding',
        className,
      )}
      {...LinkProps}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </CardStyled>
  )
}
