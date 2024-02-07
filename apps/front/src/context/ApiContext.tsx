import React, { createContext, PropsWithChildren } from 'react';
import { ClientService } from '@wishlist/api-client';

type ApiContextProps = { api: ClientService };

export const ApiContext = createContext<ApiContextProps>({} as ApiContextProps);

export type ApiProviderProps = PropsWithChildren<{ api: ClientService }>;

export const ApiProvider = ({ api, children }: ApiProviderProps) => {
  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};
