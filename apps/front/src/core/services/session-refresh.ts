import { environment } from '../../environment';
import { store } from '../store';
import { setTokens } from '../store/features/authSlice';
import { AuthService } from './auth.service';

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

const authService = new AuthService();
let inflight: Promise<string | undefined> | undefined;

type RefreshSessionData = {
  refreshSession?: {
    __typename: string;
    accessToken?: string;
    refreshToken?: string;
  };
};

async function doRefresh(): Promise<string | undefined> {
  const refreshToken = authService.refreshTokenService.getTokenFromLocalStorage();
  if (!refreshToken) return undefined;

  const response = await fetch(`${environment.apiBaseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: REFRESH_MUTATION,
      variables: { input: { refreshToken } },
    }),
  });

  const json = (await response.json()) as { data?: RefreshSessionData };
  const payload = json.data?.refreshSession;

  if (payload?.__typename !== 'LoginOutput' || !payload.accessToken || !payload.refreshToken) {
    return undefined;
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
  const access = authService.accessTokenService.getTokenFromLocalStorage();
  if (access && !authService.accessTokenService.isExpired(access.rawToken)) {
    return access.rawToken;
  }

  return await refreshSessionTokens();
}
