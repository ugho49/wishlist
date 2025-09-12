import type { PropsWithChildren } from 'react'

import { styled, Typography } from '@mui/material'

export type SubtitleProps = {
  className?: string
}

const TypographyStyled = styled(Typography)(({ theme }) => ({
  marginBottom: 28,
  color: theme.palette.primary.dark,
  fontWeight: 400,
  fontSize: '1.5rem',
  lineHeight: '1.334',
}))

export const Subtitle = ({ children, className }: PropsWithChildren<SubtitleProps>) => {
  return <TypographyStyled className={className}>{children}</TypographyStyled>
}
