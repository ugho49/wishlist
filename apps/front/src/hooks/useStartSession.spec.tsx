import type { PropsWithChildren } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

import { LS_KEYS } from '../core/services/auth.service';
import { authSlice } from '../core/store/features/authSlice';
import { useStartSession } from './useStartSession';

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('useStartSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should drop the queries cached before the login and store the new tokens', () => {
    const store = configureStore({ reducer: { auth: authSlice.reducer } });
    const queryClient = new QueryClient();
    queryClient.setQueryData(['UserProfileCurrentUser'], { currentUser: { __typename: 'UnauthorizedRejection' } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    );
    const accessToken = jwtWithPayload({ sub: 'user-id', email: 'user@test.fr', authorities: [], sid: 'session-id' });

    const { result } = renderHook(() => useStartSession(), { wrapper });
    act(() => result.current({ accessToken, refreshToken: 'refresh-token' }));

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(store.getState().auth.accessToken).toBe(accessToken);
    expect(localStorage.getItem(LS_KEYS.REFRESH_TOKEN)).toBe('refresh-token');
  });
});
