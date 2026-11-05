import type { EventId, UserId } from '@wishlist/common';

import { useCallback, useEffect, useState } from 'react';

const LS_PREFIX = 'wl_secret_santa_draw_revealed_';
const LEGACY_REVEALED_VALUE = 'true';

function getRevealedKey(eventId: EventId, userId: UserId): string {
  return `${LS_PREFIX}${eventId}_${userId}`;
}

function readStoredDraw(eventId: EventId, userId: UserId): string | null {
  try {
    return localStorage.getItem(getRevealedKey(eventId, userId));
  } catch {
    return null;
  }
}

export function storeRevealed(eventId: EventId, userId: UserId, drawSignature: string | undefined): void {
  try {
    localStorage.setItem(getRevealedKey(eventId, userId), drawSignature ?? LEGACY_REVEALED_VALUE);
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * `drawSignature` identifies one draw: when the Secret Santa is cancelled and started again,
 * the signature changes and the reveal must be shown again.
 */
export function isStoredAsRevealed(eventId: EventId, userId: UserId, drawSignature: string | undefined): boolean {
  const stored = readStoredDraw(eventId, userId);
  if (stored === null) return false;
  return drawSignature === undefined || stored === drawSignature;
}

export function useSecretSantaDrawReveal(
  eventId: EventId,
  userId: UserId | undefined,
  drawSignature: string | undefined,
): {
  isRevealed: boolean;
  markRevealed: () => void;
} {
  const [isRevealed, setIsRevealed] = useState(() =>
    userId ? isStoredAsRevealed(eventId, userId, drawSignature) : false,
  );

  useEffect(() => {
    setIsRevealed(userId ? isStoredAsRevealed(eventId, userId, drawSignature) : false);
  }, [eventId, userId, drawSignature]);

  const markRevealed = useCallback(() => {
    if (!userId) return;
    setIsRevealed(true);
    storeRevealed(eventId, userId, drawSignature);
  }, [eventId, userId, drawSignature]);

  return { isRevealed, markRevealed };
}
