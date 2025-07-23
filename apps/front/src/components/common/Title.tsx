import type { PropsWithChildren } from 'react'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import { Box, linkClasses, Stack, styled } from '@mui/material'
import clsx from 'clsx'

import { RouterLink } from './RouterLink'

const TitleRoot = styled(Stack)(({ theme }) => ({
  paddingBlock: '20px',
  '&:not(.smallMarginBottom)': {
    [theme.breakpoints.up('sm')]: {
      marginBottom: '60px',
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
}))

const RouterLinkStyled = styled(RouterLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [`&.${linkClasses.root}`]: {
    color: theme.palette.text.primary,
  },
}))

export type TitleProps = {
  smallMarginBottom?: boolean
  goBackLink?: { to: string; title: string }
}

export const Title = ({ children, smallMarginBottom = false, goBackLink }: PropsWithChildren<TitleProps>) => {
  return (
    <TitleRoot gap={1} alignItems="center" className={clsx(smallMarginBottom && 'smallMarginBottom')}>
      <Content>{children}</Content>
      {goBackLink && (
        <RouterLinkStyled to={goBackLink.to}>
          <KeyboardArrowLeftIcon fontSize="small" />
          <span>{goBackLink.title}</span>
        </RouterLinkStyled>
      )}
    </TitleRoot>
  )
}
