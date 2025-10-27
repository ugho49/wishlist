import type { PropsWithChildren } from 'react'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, IconButton, Stack, type StackProps, styled, useMediaQuery, useTheme } from '@mui/material'

import { useBackNavigation } from '../../hooks'

const TitleRoot = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: '20px',
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

export type TitleProps = StackProps & {}

export const Title = ({ children, ...props }: PropsWithChildren<TitleProps>) => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { canGoBack, handleGoBack } = useBackNavigation()

  return (
    <TitleRoot direction="row" gap={1} {...props}>
      {canGoBack && isDesktop && (
        <BackButton onClick={handleGoBack} aria-label="go back" size="small">
          <ArrowBackIcon fontSize="small" />
        </BackButton>
      )}
      <Content>{children}</Content>
    </TitleRoot>
  )
}
