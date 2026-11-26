import type { PropsWithChildren } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider, useSelector } from 'react-redux';

import { LS_KEYS } from '../core/services/auth.service';
import { authSlice } from '../core/store/features/authSlice';
import { userProfileSlice } from '../core/store/features/userProfileSlice';
import { useLogout } from './useLogout';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}));

function setup() {
  localStorage.setItem(LS_KEYS.ACCESS_TOKEN, 'access-token');
  localStorage.setItem(LS_KEYS.REFRESH_TOKEN, 'refresh-token');

  const store = configureStore({
    reducer: { auth: authSlice.reducer, userProfile: userProfileSlice.reducer },
    preloadedState: { auth: { accessToken: 'access-token' } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );

  return { store, queryClient, wrapper };
}

describe('useLogout', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    navigate.mockReset().mockResolvedValue(undefined);
    fetchMock.mockReset().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should revoke the session on the server with the stored refresh token', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(() => result.current());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string);
    expect(body.query).toContain('logout');
    expect(body.variables).toEqual({ input: { refreshToken: 'refresh-token' } });
  });

  it('should end the local session even when the server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { store, wrapper } = setup();
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(() => result.current());

    expect(localStorage.getItem(LS_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(LS_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(store.getState().auth.accessToken).toBeUndefined();
    expect(navigate).toHaveBeenCalledWith({ to: '/login' });
  });

  it('should not refetch the mounted pages while the login page loads', async () => {
    const { queryClient, wrapper } = setup();
    const tokensSeenByQuery: (string | null)[] = [];
    const queryFn = vi.fn(() => {
      tokensSeenByQuery.push(localStorage.getItem(LS_KEYS.ACCESS_TOKEN));
      return Promise.resolve({ currentUser: { __typename: 'User' } });
    });

    // An authenticated page: it reads the auth state, like the layout does, so a logout re-renders it.
    const { result, unmount } = renderHook(
      () => {
        useSelector((state: { auth: { accessToken?: string } }) => state.auth.accessToken);
        useQuery({ queryKey: ['UserProfileCurrentUser'], queryFn });
        return useLogout();
      },
      { wrapper },
    );
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));

    // The login route is lazy-loaded: the authenticated page stays mounted until it is ready.
    const navigation = Promise.withResolvers<void>();
    navigate.mockReturnValue(navigation.promise);

    let logout: Promise<void> = Promise.resolve();
    act(() => {
      logout = result.current();
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/login' }));
    await act(
      () =>
        new Promise(resolve => {
          setTimeout(resolve, 20);
        }),
    );

    expect(localStorage.getItem(LS_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(tokensSeenByQuery).toEqual(['access-token']);

    // The router resolves once the login route has replaced the authenticated pages.
    unmount();
    navigation.resolve();
    await act(() => logout);

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});
