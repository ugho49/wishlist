import type { PropsWithChildren } from 'react'

import { Box, Stack, styled, useTheme } from '@mui/material'

export type StatusProps = {
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  colorGradient?: 'light' | 'main' | 'dark'
  text?: string
}

const Bullet = styled('div')({
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  margin: 'auto',
})

export const Status = ({ color = 'primary', colorGradient = 'light', text }: PropsWithChildren<StatusProps>) => {
  const theme = useTheme()

  return (
    <Stack flexDirection="row" alignItems="center" gap={1}>
      <Bullet sx={{ backgroundColor: theme.palette[color][colorGradient] }} />
      {text && <Box>{text}</Box>}
    </Stack>
  )
}
