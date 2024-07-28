import { ApiClient } from '@wishlist/api-client'
import React, { createContext, PropsWithChildren } from 'react'

type ApiContextProps = { api: ApiClient }

export const ApiContext = createContext<ApiContextProps>({} as ApiContextProps)

export type ApiProviderProps = PropsWithChildren<{ api: ApiClient }>

export const ApiProvider = ({ api, children }: ApiProviderProps) => {
  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
}
