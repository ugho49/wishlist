import type { SxProps, Theme } from '@mui/material'

import { Box, Stack, styled } from '@mui/material'

interface LogoProps {
  height?: number
  variant?: 'icon-only' | 'full' | 'text-only'
  color?: string
  sx?: SxProps<Theme>
}

const LogoImage = styled('img')({
  height: 'auto',
  maxWidth: '100%',
  display: 'block',
})

export const Logo = ({ height = 48, variant = 'full', color, sx, ...props }: LogoProps) => {
  if (variant === 'icon-only') {
    return (
      <Box sx={sx} {...props}>
        <LogoImage src="/icon.png" alt="Wishlist" style={{ height, width: height }} />
      </Box>
    )
  }

  if (variant === 'text-only') {
    return (
      <Box sx={sx} {...props}>
        <LogoImage src="/logo_text.png" alt="Wishlist" style={{ height }} />
      </Box>
    )
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={sx} {...props}>
      <LogoImage src="/icon.png" alt="" style={{ height, width: height }} />
      <LogoImage src="/logo_text.png" alt="Wishlist" style={{ height: height * 0.8 }} />
    </Stack>
  )
}
