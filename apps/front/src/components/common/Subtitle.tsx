import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system'
import type { PropsWithChildren } from 'react'

import { Typography, useTheme } from '@mui/material'
import React from 'react'

export type SubtitleProps = {
  sx?: SxProps<Theme>
}

export const Subtitle = ({ children, sx = {} }: PropsWithChildren<SubtitleProps>) => {
  const theme = useTheme()

  return (
    <Typography component="h1" variant="h5" sx={{ marginBottom: '20px', color: theme.palette.primary.dark, ...sx }}>
      {children}
    </Typography>
  )
}
