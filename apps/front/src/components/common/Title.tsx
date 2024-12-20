import type { Theme } from '@mui/material'
import type { PropsWithChildren } from 'react'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import { Box, linkClasses, Stack } from '@mui/material'
import { makeStyles } from '@mui/styles'
import clsx from 'clsx'
import React from 'react'

import { RouterLink } from './RouterLink'

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBlock: '20px',
    '&:not(.smallMarginBottom)': {
      [theme.breakpoints.up('sm')]: {
        marginBottom: '60px',
      },
    },
  },
  h1: {
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    fontWeight: 300,
    fontSize: '1.6rem',
    letterSpacing: '.05em',
    margin: 0,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    [`&.${linkClasses.root}`]: {
      color: theme.palette.text.primary,
    },
  },
}))

export type TitleProps = {
  smallMarginBottom?: boolean
  goBackLink?: { to: string; title: string }
}

export const Title = ({ children, smallMarginBottom = false, goBackLink }: PropsWithChildren<TitleProps>) => {
  const classes = useStyles()

  return (
    <Stack gap={1} alignItems="center" className={clsx(classes.title, smallMarginBottom && 'smallMarginBottom')}>
      <Box className={classes.h1}>{children}</Box>
      {goBackLink && (
        <RouterLink to={goBackLink.to} className={classes.link}>
          <KeyboardArrowLeftIcon fontSize="small" />
          <span>{goBackLink.title}</span>
        </RouterLink>
      )}
    </Stack>
  )
}
