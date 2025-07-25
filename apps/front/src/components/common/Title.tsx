import type { PropsWithChildren } from 'react'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, IconButton, Stack, styled, useMediaQuery, useTheme } from '@mui/material'
import clsx from 'clsx'

import { useBackNavigation } from '../../hooks'

const TitleRoot = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingBlock: '20px',
  '&:not(.smallMarginBottom)': {
    [theme.breakpoints.up('sm')]: {
      marginTop: '10px',
      marginBottom: '20px',
    },
  },
}))

const Content = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  fontWeight: 300,
  fontSize: '1.6rem',
  letterSpacing: '.05em',
  margin: 0,
  textAlign: 'center',
}))

const BackButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(1),
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('md')]: {
    display: 'none', // Hide on mobile since we have MobileTopBar
  },
}))

export type TitleProps = {
  smallMarginBottom?: boolean
}

export const Title = ({ children, smallMarginBottom = false }: PropsWithChildren<TitleProps>) => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { canGoBack, handleGoBack } = useBackNavigation()

  return (
    <TitleRoot direction="row" gap={1} className={clsx(smallMarginBottom && 'smallMarginBottom')}>
      {canGoBack && isDesktop && (
        <BackButton onClick={handleGoBack} aria-label="go back" size="small">
          <ArrowBackIcon fontSize="small" />
        </BackButton>
      )}
      <Content>{children}</Content>
    </TitleRoot>
  )
}
