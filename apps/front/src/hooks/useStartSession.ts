import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setTokens } from '../core/store/features/authSlice';

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Stores the tokens of a new login. Cached queries belong to no session, or to another account:
 * they are dropped so the authenticated pages never render, or react to, a previous session's data.
 */
export function useStartSession() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useCallback(
    (tokens: SessionTokens) => {
      queryClient.removeQueries();
      dispatch(setTokens(tokens));
    },
    [dispatch, queryClient],
  );
}
