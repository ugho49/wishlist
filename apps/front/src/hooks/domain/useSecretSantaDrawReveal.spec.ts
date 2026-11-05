import type { EventId, UserId } from '@wishlist/common';

import { isStoredAsRevealed, storeRevealed } from './useSecretSantaDrawReveal';

const eventId = 'event-1' as EventId;
const userId = 'user-1' as UserId;

describe('useSecretSantaDrawReveal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not be revealed when nothing is stored', () => {
    expect(isStoredAsRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z')).toBe(false);
  });

  it('should be revealed for the draw that was scratched', () => {
    storeRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z');

    expect(isStoredAsRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z')).toBe(true);
  });

  it('should not be revealed when the draw was cancelled and started again', () => {
    storeRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z');

    expect(isStoredAsRevealed(eventId, userId, 'santa-1:2026-11-03T18:30:00.000Z')).toBe(false);
  });

  it('should not trust the legacy flag once the draw is known', () => {
    localStorage.setItem(`wl_secret_santa_draw_revealed_${eventId}_${userId}`, 'true');

    expect(isStoredAsRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z')).toBe(false);
  });

  it('should be revealed when anything is stored and the draw is unknown', () => {
    storeRevealed(eventId, userId, 'santa-1:2026-11-01T10:00:00.000Z');

    expect(isStoredAsRevealed(eventId, userId, undefined)).toBe(true);
  });
});
