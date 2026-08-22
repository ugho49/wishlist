import type { EventId, UserId } from '@wishlist/common';

import { useCallback, useEffect, useState } from 'react';

const LS_PREFIX = 'wl_secret_santa_draw_revealed_';

function getRevealedKey(eventId: EventId, userId: UserId): string {
  return `${LS_PREFIX}${eventId}_${userId}`;
}

function isStoredAsRevealed(eventId: EventId, userId: UserId): boolean {
  try {
    return localStorage.getItem(getRevealedKey(eventId, userId)) === 'true';
  } catch {
    return false;
  }
}

function storeRevealed(eventId: EventId, userId: UserId): void {
  try {
    localStorage.setItem(getRevealedKey(eventId, userId), 'true');
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function useSecretSantaDrawReveal(
  eventId: EventId,
  userId: UserId | undefined,
): {
  isRevealed: boolean;
  markRevealed: () => void;
} {
  const [isRevealed, setIsRevealed] = useState(() => (userId ? isStoredAsRevealed(eventId, userId) : false));

  useEffect(() => {
    setIsRevealed(userId ? isStoredAsRevealed(eventId, userId) : false);
  }, [eventId, userId]);

  const markRevealed = useCallback(() => {
    if (!userId) return;
    setIsRevealed(true);
    storeRevealed(eventId, userId);
  }, [eventId, userId]);

  return { isRevealed, markRevealed };
}
