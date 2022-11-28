import { URLSearchParamsInit, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

type ParamType<T> = T & { [key: string]: string | string[] | undefined };

function convertToUrlSearchParam<T>(params?: ParamType<T>): URLSearchParamsInit {
  const urlSearchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        // @ts-ignore
        urlSearchParams.append(key, value);
      }
    });
  }
  return urlSearchParams;
}

type NextParams<T> = ParamType<T> | ((prevState: T) => ParamType<T | undefined>);
type CustomSearchParamsRes<T> = [T, (nextParams?: NextParams<T>) => void];

export const useCustomSearchParams = <T>(defaultParams?: ParamType<T>): CustomSearchParamsRes<T> => {
  const [search, setSearch] = useSearchParams(convertToUrlSearchParam(defaultParams));

  const searchAsObject = useMemo(() => {
    // @ts-ignore
    return Object.fromEntries(new URLSearchParams(search)) as T;
  }, [search]);

  const setSearchObjects = useCallback(
    (nextParams?: NextParams<T>) => {
      const newParams = typeof nextParams === 'function' ? nextParams(searchAsObject) : nextParams;
      setSearch(convertToUrlSearchParam(newParams));
    },
    [searchAsObject, setSearch]
  );

  return [searchAsObject, setSearchObjects];
};
