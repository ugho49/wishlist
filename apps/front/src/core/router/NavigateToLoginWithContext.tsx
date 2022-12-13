import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function getSearchParams({ pathname, search }: { pathname: string; search: string }): string {
  if (pathname !== '/') {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('redirectUrl', `${pathname}${search}`);
    return urlSearchParams.toString();
  }
  return '';
}

export const NavigateToLoginWithContext = () => {
  const location = useLocation();

  return <Navigate replace to={{ pathname: '/login', search: getSearchParams(location) }} />;
};
