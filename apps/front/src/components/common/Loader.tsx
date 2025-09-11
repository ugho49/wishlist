import type { SxProps, Theme } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { CircularProgress, Stack } from '@mui/material'

type LoaderProps = {
  loading: boolean
  sx?: SxProps<Theme>
}

export const Loader = ({ children, loading, sx }: PropsWithChildren<LoaderProps>) => {
  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', marginTop: '100px', marginBottom: '100px', ...sx }}>
        <CircularProgress />
      </Stack>
    )
  }

  return <>{children}</>
}
