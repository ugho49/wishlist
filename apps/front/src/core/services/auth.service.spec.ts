import { AuthService } from './auth.service';

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('AccessTokenService', () => {
  const accessTokenService = new AuthService().accessTokenService;
  const futureExp = Math.floor(Date.now() / 1000) + 3600;

  it('should detect a session id on the access token', () => {
    const token = jwtWithPayload({ sub: 'user-id', sid: 'session-id', exp: futureExp });

    expect(accessTokenService.hasSessionId(token)).toBe(true);
    expect(accessTokenService.isUsable(token)).toBe(true);
  });

  it('should treat a legacy access token without sid as unusable', () => {
    const token = jwtWithPayload({ sub: 'user-id', exp: futureExp });

    expect(accessTokenService.hasSessionId(token)).toBe(false);
    expect(accessTokenService.isExpired(token)).toBe(false);
    expect(accessTokenService.isUsable(token)).toBe(false);
  });
});
