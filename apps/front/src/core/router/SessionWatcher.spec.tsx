import type { PropsWithChildren } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { LS_KEYS } from '../services/auth.service';
import { authSlice } from '../store/features/authSlice';
import { SessionWatcher } from './SessionWatcher';

const logout = vi.fn();
const addToast = vi.fn();
const refreshSessionTokens = vi.fn<() => Promise<string | undefined>>();

vi.mock('../../hooks/useLogout', () => ({ useLogout: () => logout }));
vi.mock('../../hooks/useToast', () => ({ useToast: () => ({ addToast }) }));
vi.mock('../services/session-refresh', () => ({ refreshSessionTokens: () => refreshSessionTokens() }));

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

function renderWatcher() {
  // Expires within the refresh window: the watcher refreshes it right away.
  const accessToken = jwtWithPayload({ sub: 'user-id', sid: 'session-id', exp: Math.floor(Date.now() / 1000) + 10 });
  localStorage.setItem(LS_KEYS.REFRESH_TOKEN, 'refresh-token');
  const store = configureStore({ reducer: { auth: authSlice.reducer }, preloadedState: { auth: { accessToken } } });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;

  return render(<SessionWatcher />, { wrapper });
}

describe('SessionWatcher', () => {
  beforeEach(() => {
    localStorage.clear();
    logout.mockReset();
    addToast.mockReset();
    refreshSessionTokens.mockReset();
  });

  it('should expire the session when the refresh is rejected', async () => {
    refreshSessionTokens.mockResolvedValue(undefined);

    renderWatcher();

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning' }));
  });

  it('should not expire a session that was logged out while refreshing', async () => {
    const refresh = Promise.withResolvers<string | undefined>();
    refreshSessionTokens.mockReturnValue(refresh.promise);

    renderWatcher();
    await waitFor(() => expect(refreshSessionTokens).toHaveBeenCalled());

    localStorage.removeItem(LS_KEYS.REFRESH_TOKEN);
    await act(async () => {
      refresh.resolve(undefined);
      await refresh.promise;
    });

    expect(logout).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
  });
});
