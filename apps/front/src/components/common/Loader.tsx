import type { PropsWithChildren } from 'react'

import { CircularProgress, Stack } from '@mui/material'
import React from 'react'

type LoaderProps = {
  loading: boolean
}

export const Loader = ({ children, loading }: PropsWithChildren<LoaderProps>) => {
  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', marginTop: '100px', marginBottom: '100px' }}>
        <CircularProgress />
      </Stack>
    )
  }

  return <>{children}</>
}
