import { environment } from '../../environment';
import { store } from '../store';
import { setTokens } from '../store/features/authSlice';
import { AuthService } from './auth.service';

const GRAPHQL_ENDPOINT = `${environment.apiBaseUrl}/graphql`;

const REFRESH_MUTATION = /* GraphQL */ `
  mutation AuthRefreshSession($input: RefreshSessionInput!) {
    refreshSession(input: $input) {
      __typename
      ... on LoginOutput {
        accessToken
        refreshToken
      }
    }
  }
`;

const LOGOUT_MUTATION = /* GraphQL */ `
  mutation AuthLogout($input: LogoutInput!) {
    logout(input: $input) {
      __typename
    }
  }
`;

const authService = new AuthService();
let inflight: Promise<string | undefined> | undefined;

type RefreshSessionData = {
  refreshSession?: {
    __typename: string;
    accessToken?: string;
    refreshToken?: string;
  };
};

const postGraphql = (query: string, variables: Record<string, unknown>) =>
  fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

/** Revokes the server session behind a refresh token. Best effort: a failure never blocks the caller. */
export async function revokeSession(refreshToken: string): Promise<void> {
  try {
    await postGraphql(LOGOUT_MUTATION, { input: { refreshToken } });
  } catch {
    // The local session is cleared anyway; the server session expires on its own.
  }
}

function storedUsableAccessToken(): string | undefined {
  const access = authService.accessTokenService.getTokenFromLocalStorage();
  return access && authService.accessTokenService.isUsable(access.rawToken) ? access.rawToken : undefined;
}

async function doRefresh(): Promise<string | undefined> {
  const refreshToken = authService.refreshTokenService.getTokenFromLocalStorage();
  if (!refreshToken) return undefined;

  const response = await postGraphql(REFRESH_MUTATION, { input: { refreshToken } });
  const json = (await response.json()) as { data?: RefreshSessionData };
  const payload = json.data?.refreshSession;

  // A logout or another login replaced the stored session while this request was in flight.
  const sessionChanged = authService.refreshTokenService.getTokenFromLocalStorage() !== refreshToken;

  if (payload?.__typename !== 'LoginOutput' || !payload.accessToken || !payload.refreshToken) {
    return sessionChanged ? storedUsableAccessToken() : undefined;
  }

  if (sessionChanged) {
    // Never bring back a session that was closed meanwhile, and do not leave its rotated token alive.
    void revokeSession(payload.refreshToken);
    return storedUsableAccessToken();
  }

  store.dispatch(setTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken }));
  return payload.accessToken;
}

export function refreshSessionTokens(): Promise<string | undefined> {
  if (!inflight) {
    inflight = doRefresh().finally(() => {
      inflight = undefined;
    });
  }

  return inflight;
}

export async function getValidAccessToken(): Promise<string | undefined> {
  return storedUsableAccessToken() ?? (await refreshSessionTokens());
}
