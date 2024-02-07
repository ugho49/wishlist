import React, { createContext, PropsWithChildren } from 'react';
import { ApiClient } from '@wishlist/api-client';

type ApiContextProps = { api: ApiClient };

export const ApiContext = createContext<ApiContextProps>({} as ApiContextProps);

export type ApiProviderProps = PropsWithChildren<{ api: ApiClient }>;

export const ApiProvider = ({ api, children }: ApiProviderProps) => {
  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};
