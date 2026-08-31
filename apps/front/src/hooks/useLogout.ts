import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AuthService } from '../core/services/auth.service';
import { resetStore } from '../core/store/features/resetStore';
import { environment } from '../environment';

const LOGOUT_MUTATION = /* GraphQL */ `
  mutation AuthLogout($input: LogoutInput!) {
    logout(input: $input) {
      __typename
    }
  }
`;

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const redirectToLogin = useCallback(() => navigate({ to: '/login' }), [navigate]);
  const queryClient = useQueryClient();
  const authService = new AuthService();

  return async () => {
    const refreshToken = authService.refreshTokenService.getTokenFromLocalStorage();
    if (refreshToken) {
      try {
        await fetch(`${environment.apiBaseUrl}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: LOGOUT_MUTATION,
            variables: { input: { refreshToken } },
          }),
        });
      } catch {
        // Best effort: always clear the local session even if the server call fails.
      }
    }

    await queryClient.cancelQueries();
    await queryClient.invalidateQueries();
    queryClient.getQueryCache().clear();
    resetStore(dispatch);
    void redirectToLogin();
  };
}
