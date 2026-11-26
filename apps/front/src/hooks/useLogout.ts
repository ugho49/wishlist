import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AuthService } from '../core/services/auth.service';
import { revokeSession } from '../core/services/session-refresh';
import { resetStore } from '../core/store/features/resetStore';

const authService = new AuthService();

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const refreshToken = authService.refreshTokenService.getTokenFromLocalStorage();

    // Drop the tokens first: no request can use them anymore, and the authenticated layout
    // sees a logout instead of an expired session.
    resetStore(dispatch);
    const revocation = refreshToken ? revokeSession(refreshToken) : Promise.resolve();

    // Keep the cache while the authenticated pages are mounted: clearing it under them makes
    // their queries refetch right away without a token and cache the UnauthorizedRejection.
    await queryClient.cancelQueries();
    try {
      await navigate({ to: '/login' });
    } finally {
      queryClient.clear();
    }

    await revocation;
  }, [dispatch, navigate, queryClient]);
}
