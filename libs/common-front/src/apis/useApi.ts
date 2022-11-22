import { useContext } from 'react';
import { ApiRef } from './ApiRef';
import { ApiContext } from './ApiContext';

export function useApi<T>(apiRef: ApiRef<T>): T {
  const { apis } = useContext(ApiContext);

  if (apis[apiRef.id] === undefined) {
    throw new Error(`No implementation available for ${apiRef}`);
  }

  return apis[apiRef.id] as T;
}
