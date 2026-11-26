import type { PropsWithChildren } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { authSlice } from '../core/store/features/authSlice';
import { useExpireSessionOnUnauthorized } from './useExpireSessionOnUnauthorized';

const logout = vi.fn();
const addToast = vi.fn();

vi.mock('./useLogout', () => ({ useLogout: () => logout }));
vi.mock('./useToast', () => ({ useToast: () => ({ addToast }) }));

const QUERY_KEY = ['UserProfileCurrentUser'];
const user = { __typename: 'User' };
const rejection = { __typename: 'UnauthorizedRejection' };

function setup({ accessToken }: { accessToken?: string }) {
  const store = configureStore({ reducer: { auth: authSlice.reducer }, preloadedState: { auth: { accessToken } } });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );

  return { queryClient, wrapper };
}

function renderCurrentUser(
  queryFn: () => Promise<{ __typename: string }>,
  wrapper: ReturnType<typeof setup>['wrapper'],
) {
  return renderHook(
    () => {
      const query = useQuery({ queryKey: QUERY_KEY, queryFn });
      useExpireSessionOnUnauthorized(query);
      return query;
    },
    { wrapper },
  );
}

describe('useExpireSessionOnUnauthorized', () => {
  beforeEach(() => {
    logout.mockReset();
    addToast.mockReset();
  });

  it('should end the session when the current token is rejected', async () => {
    const { wrapper } = setup({ accessToken: 'access-token' });

    renderCurrentUser(async () => rejection, wrapper);

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning' }));
  });

  it('should ignore a rejection cached by a previous session', async () => {
    const { queryClient, wrapper } = setup({ accessToken: 'new-access-token' });
    queryClient.setQueryData(QUERY_KEY, rejection);

    const { result } = renderCurrentUser(async () => user, wrapper);

    await waitFor(() => expect(result.current.data).toEqual(user));
    expect(logout).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
  });

  it('should ignore a rejection received while logging out', async () => {
    const { wrapper } = setup({ accessToken: undefined });

    const { result } = renderCurrentUser(async () => rejection, wrapper);

    await waitFor(() => expect(result.current.isFetchedAfterMount).toBe(true));
    expect(logout).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
  });

  it('should end the session only once', async () => {
    const { wrapper } = setup({ accessToken: 'access-token' });

    const { result } = renderCurrentUser(async () => rejection, wrapper);
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    await result.current.refetch();

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
