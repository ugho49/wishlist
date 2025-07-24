import type { SxProps, Theme } from '@mui/material'

import { Box, Stack, styled } from '@mui/material'

import LogoTextSvg from '../../assets/logo/logo_text.svg?react'
import LogoIconSvg from '../../assets/logo/logo.svg?react'

interface LogoProps {
  height?: number
  variant?: 'icon-only' | 'full' | 'text-only'
  color?: string
  sx?: SxProps<Theme>
}

const LogoIconStyled = styled(LogoIconSvg)<{ color?: string }>(({ color, theme }) => ({
  height: 'auto',
  maxWidth: '100%',
  display: 'block',
  color: color || theme.palette.primary.main,
}))

const LogoTextStyled = styled(LogoTextSvg)<{ color?: string }>(({ color, theme }) => ({
  height: 'auto',
  maxWidth: '100%',
  display: 'block',
  color: color || theme.palette.primary.main,
}))

export const Logo = ({ height = 48, variant = 'full', color, sx, ...props }: LogoProps) => {
  if (variant === 'icon-only') {
    return (
      <Box sx={sx} {...props}>
        <LogoIconStyled style={{ height, width: height }} color={color} />
      </Box>
    )
  }

  if (variant === 'text-only') {
    return (
      <Box sx={sx} {...props}>
        <LogoTextStyled style={{ height }} color={color} />
      </Box>
    )
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={sx} {...props}>
      <LogoIconStyled style={{ height, width: height }} color={color} />
      <LogoTextStyled style={{ height: height * 0.8 }} color={color} />
    </Stack>
  )
}
