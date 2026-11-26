import { store } from '../store';
import { resetAuthState } from '../store/features/authSlice';
import { LS_KEYS } from './auth.service';
import { refreshSessionTokens } from './session-refresh';

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

const rotatedAccessToken = jwtWithPayload({
  sub: 'user-id',
  email: 'user@test.fr',
  authorities: [],
  sid: 'session-id',
  exp: Math.floor(Date.now() / 1000) + 3600,
});

const refreshResponse = () =>
  new Response(
    JSON.stringify({
      data: {
        refreshSession: { __typename: 'LoginOutput', accessToken: rotatedAccessToken, refreshToken: 'rotated-refresh' },
      },
    }),
  );

const bodyOf = (call: unknown[] | undefined) => JSON.parse(String((call?.[1] as RequestInit | undefined)?.body));

describe('refreshSessionTokens', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    store.dispatch(resetAuthState());
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem(LS_KEYS.REFRESH_TOKEN, 'refresh-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should store the rotated tokens', async () => {
    fetchMock.mockResolvedValue(refreshResponse());

    await expect(refreshSessionTokens()).resolves.toBe(rotatedAccessToken);

    expect(store.getState().auth.accessToken).toBe(rotatedAccessToken);
    expect(localStorage.getItem(LS_KEYS.REFRESH_TOKEN)).toBe('rotated-refresh');
  });

  it('should not bring back a session logged out while refreshing', async () => {
    const refreshRequest = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(refreshRequest.promise);
    fetchMock.mockResolvedValue(new Response('{}'));

    const refresh = refreshSessionTokens();
    store.dispatch(resetAuthState());
    refreshRequest.resolve(refreshResponse());

    await expect(refresh).resolves.toBeUndefined();
    expect(store.getState().auth.accessToken).toBeUndefined();
    expect(localStorage.getItem(LS_KEYS.REFRESH_TOKEN)).toBeNull();
    // The rotated token is revoked so the server session does not outlive the logout.
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(bodyOf(fetchMock.mock.calls[1])).toMatchObject({
      query: expect.stringContaining('logout'),
      variables: { input: { refreshToken: 'rotated-refresh' } },
    });
  });
});
