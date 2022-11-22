import React, { createContext } from 'react';
import { AnyApiFactory } from './ApiFactory';

type ApiContextProps = { apis: { [key: string]: unknown } };
export const ApiContext = createContext<ApiContextProps>({ apis: {} });

export type ApiProviderProps = {
  apis: AnyApiFactory[];
  children: React.ReactNode | React.ReactNode[] | undefined;
};

export const ApiProvider: React.FC<ApiProviderProps> = ({ apis, children }) => {
  const map = apis.reduce((acc, { api, factory }) => {
    return { ...acc, [api.id]: factory() };
  }, {});

  return <ApiContext.Provider value={{ apis: map }}>{children}</ApiContext.Provider>;
};
