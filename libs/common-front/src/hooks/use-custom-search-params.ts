import { URLSearchParamsInit, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

type ParamType<T> = T & { [key: string]: string | string[] | undefined };

function convertToUrlSearchParam<T>(params?: ParamType<T>): URLSearchParamsInit {
  const urlSearchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        urlSearchParams.append(key, value);
      }

      if (value && Array.isArray(value)) {
        for (const v of value) {
          urlSearchParams.append(key, v);
        }
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
    return Object.fromEntries(new URLSearchParams(search)) as T;
  }, [search]);

  const setSearchObjects = useCallback(
    (nextParams?: NextParams<T>) => {
      const newParams = typeof nextParams === 'function' ? nextParams(searchAsObject) : nextParams;
      setSearch(convertToUrlSearchParam(newParams), { replace: true });
    },
    [searchAsObject, setSearch]
  );

  return [searchAsObject, setSearchObjects];
};
