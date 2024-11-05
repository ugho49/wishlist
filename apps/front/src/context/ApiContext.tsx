import type { PropsWithChildren } from 'react'

import { ApiClient } from '@wishlist/api-client'
import React, { createContext, useMemo, useState } from 'react'

import { environment } from '../environment'

type ApiContextProps = { api: ApiClient; setAccessToken: (token: string) => void; unsetTokens: () => void }

export const ApiContext = createContext<ApiContextProps>({} as ApiContextProps)

export const ApiProvider = ({ children }: PropsWithChildren) => {
  const [accessToken, setAccessToken] = useState<string>()

  const api = useMemo(
    () =>
      ApiClient.create({
        baseURL: environment.baseUrl,
        timeoutInMs: 10_000, // 10 seconds
        accessToken,
      }),
    [accessToken],
  )

  return (
    <ApiContext.Provider value={{ api, setAccessToken, unsetTokens: () => setAccessToken(undefined) }}>
      {children}
    </ApiContext.Provider>
  )
}
