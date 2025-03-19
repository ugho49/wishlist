import type { PropsWithChildren } from 'react'

import { LoadingPage } from './LoadingPage'

type LoaderProps = {
  loading: boolean
}

export const Loader = ({ children, loading }: PropsWithChildren<LoaderProps>) => {
  if (loading) {
    return <LoadingPage />
  }

  return <>{children}</>
}
