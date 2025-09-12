import type { SxProps, Theme } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { styled, Typography } from '@mui/material'

export type SubtitleProps = {
  className?: string
  sx?: SxProps<Theme>
}

const TypographyStyled = styled(Typography)(({ theme }) => ({
  marginBottom: 28,
  color: theme.palette.primary.dark,
  fontWeight: 400,
  fontSize: '1.4rem',
  lineHeight: '1.334',
}))

export const Subtitle = ({ children, className, sx }: PropsWithChildren<SubtitleProps>) => {
  return (
    <TypographyStyled className={className} sx={sx}>
      {children}
    </TypographyStyled>
  )
}
