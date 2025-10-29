import type { EventId } from '@wishlist/common'

import { DateTime } from 'luxon'
import { useCallback, useMemo, useState } from 'react'

import { useSecretSanta } from './useSecretSanta'

const LS_PREFIX = 'wl_secret_santa_suggestion_dismissed_'

function getDismissedKey(eventId: EventId): string {
  return `${LS_PREFIX}${eventId}`
}

function isDismissed(eventId: EventId): boolean {
  try {
    return localStorage.getItem(getDismissedKey(eventId)) === 'true'
  } catch {
    return false
  }
}

function setDismissed(eventId: EventId): void {
  try {
    localStorage.setItem(getDismissedKey(eventId), 'true')
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Check if event date falls between December 15 and January 1
 */
function isEventInChristmasPeriod(eventDate: DateTime): boolean {
  const month = eventDate.month
  const day = eventDate.day

  // December 15-31
  if (month === 12 && day >= 15) {
    return true
  }

  // January 1
  if (month === 1 && day === 1) {
    return true
  }

  return false
}

/**
 * Check if title contains Christmas-related keywords (case-insensitive)
 */
function containsChristmasKeyword(title: string): boolean {
  const christmasKeywords = ['noel', 'noël', 'christmas', 'xmas']

  const normalizedTitle = title.toLowerCase()

  return christmasKeywords.some(keyword => normalizedTitle.includes(keyword))
}

interface UseSecretSantaSuggestionProps {
  eventId: EventId
  eventDate?: string
  eventTitle?: string
  currentUserCanEdit: boolean
}

/**
 * Hook to determine if the Secret Santa suggestion card should be displayed
 *
 * Conditions:
 * - User must be a maintainer (currentUserCanEdit = true)
 * - No Secret Santa should exist yet
 * - Event date must be between December 15 and January 1, OR
 * - Event title must contain Christmas-related keywords
 * - User has not dismissed the suggestion for this event
 */
export function useSecretSantaSuggestion({
  eventId,
  eventDate,
  eventTitle,
  currentUserCanEdit,
}: UseSecretSantaSuggestionProps): {
  shouldShowSuggestion: boolean
  dismissSuggestion: () => void
} {
  const [isDismissedState, setIsDismissedState] = useState(isDismissed(eventId))
  const { secretSanta } = useSecretSanta(eventId, { enabled: currentUserCanEdit && !isDismissedState })

  const dismissSuggestion = useCallback(() => {
    setIsDismissedState(true)
    setDismissed(eventId)
  }, [eventId])

  const shouldShowSuggestion = useMemo(() => {
    // Must be maintainer
    if (!currentUserCanEdit) return false

    // Check if user has dismissed the suggestion
    if (isDismissedState) return false

    // Secret Santa must not exist
    if (secretSanta) return false

    // Must have event data
    if (!eventDate || !eventTitle) return false

    // Check date range: December 15 to January 1
    const eventDateFormatted = DateTime.fromISO(eventDate)
    const isInChristmasPeriod = isEventInChristmasPeriod(eventDateFormatted)

    // Check title for Christmas keywords
    const hasChristmasKeyword = containsChristmasKeyword(eventTitle)

    return isInChristmasPeriod && hasChristmasKeyword
  }, [eventDate, eventTitle, secretSanta, currentUserCanEdit, isDismissedState])

  return { shouldShowSuggestion, dismissSuggestion }
}
