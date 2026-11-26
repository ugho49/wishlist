import type { RootState } from '../core/store';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useLogout } from './useLogout';
import { useToast } from './useToast';

type CurrentUserQueryResult = {
  data?: { __typename?: string };
  isFetchedAfterMount: boolean;
};

const selectAccessToken = (state: RootState) => state.auth.accessToken;

/**
 * Ends the session when the API rejects the stored token for the current user.
 *
 * Only a rejection fetched since mount, while a session exists, counts: one cached by a previous
 * session or received during a logout says nothing about the current session, and logging out
 * on it would revoke a session the user just opened.
 */
export function useExpireSessionOnUnauthorized({ data, isFetchedAfterMount }: CurrentUserQueryResult) {
  const accessToken = useSelector(selectAccessToken);
  const { addToast } = useToast();
  const logout = useLogout();
  const expiredRef = useRef(false);
  const rejected = isFetchedAfterMount && data?.__typename === 'UnauthorizedRejection';

  useEffect(() => {
    if (!rejected || !accessToken || expiredRef.current) return;

    expiredRef.current = true;
    addToast({ message: 'Votre session a expiré, veuillez vous reconnecter', variant: 'warning' });
    void logout();
  }, [rejected, accessToken, addToast, logout]);
}
