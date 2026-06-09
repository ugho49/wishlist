import type { ReactNode } from 'react'

import { Box, styled, Typography } from '@mui/material'

import { landingTokens } from '../landing/landing.tokens'

const TitleStyled = styled(Typography)(() => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: '1.9rem',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: landingTokens.ink,
}))

const SubtitleStyled = styled(Typography)(({ theme }) => ({
  color: landingTokens.inkMuted,
  marginTop: theme.spacing(1),
  lineHeight: 1.6,
}))

interface AuthFormHeaderProps {
  title: string
  subtitle?: ReactNode
}

export const AuthFormHeader = ({ title, subtitle }: AuthFormHeaderProps) => (
  <Box>
    <TitleStyled variant="h1">{title}</TitleStyled>
    {subtitle && <SubtitleStyled variant="body2">{subtitle}</SubtitleStyled>}
  </Box>
)
