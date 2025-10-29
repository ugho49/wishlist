import type { SxProps, Theme } from '@mui/material'
import type { PropsWithChildren } from 'react'

import { Loading } from './Loading'

type LoaderProps = {
  loading: boolean
  sx?: SxProps<Theme>
}

export const Loader = ({ children, loading, sx }: PropsWithChildren<LoaderProps>) => {
  if (loading) {
    return <Loading sx={sx} />
  }

  return <>{children}</>
}
