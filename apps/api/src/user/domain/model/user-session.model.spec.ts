import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserSessionDeviceType } from '../user-session-device-type.enum';
import { UserSession } from './user-session.model';
import { describe, expect, it } from 'bun:test';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

describe('UserSession', () => {
  const user = new UserBuilder().build();

  it('should parse the user agent once at creation', () => {
    const session = UserSession.create({
      id: uuid() as never,
      userId: user.id,
      tokenHash: 'a'.repeat(64),
      userAgent: CHROME_MAC,
      ip: '127.0.0.1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(session.userAgent).toBe(CHROME_MAC);
    expect(session.browser).toBe('Chrome');
    expect(session.os).toBe('macOS');
    expect(session.deviceType).toBe(UserSessionDeviceType.DESKTOP);
    expect(session.label).toBe('Apple Macintosh');
  });

  it('should not update the user agent or parsed device on rotate', () => {
    const session = UserSession.create({
      id: uuid() as never,
      userId: user.id,
      tokenHash: 'a'.repeat(64),
      userAgent: CHROME_MAC,
      ip: '127.0.0.1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const rotated = session.rotate({
      tokenHash: 'b'.repeat(64),
      expiresAt: new Date(Date.now() + 120_000),
      ip: '10.0.0.2',
    });

    expect(rotated.userAgent).toBe(CHROME_MAC);
    expect(rotated.browser).toBe('Chrome');
    expect(rotated.deviceType).toBe(UserSessionDeviceType.DESKTOP);
    expect(rotated.ip).toBe('10.0.0.2');
    expect(rotated.tokenHash).toBe('b'.repeat(64));
  });

  it('should not update the user agent or parsed device on touch', () => {
    const session = UserSession.create({
      id: uuid() as never,
      userId: user.id,
      tokenHash: 'a'.repeat(64),
      userAgent: CHROME_MAC,
      ip: '127.0.0.1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const touched = session.touch({ ip: '10.0.0.3' });

    expect(touched.userAgent).toBe(CHROME_MAC);
    expect(touched.browser).toBe('Chrome');
    expect(touched.ip).toBe('10.0.0.3');
  });
});
