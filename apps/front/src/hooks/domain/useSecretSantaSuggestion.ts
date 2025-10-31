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

  // January 1 - 15
  if (month === 1 && day <= 15) {
    return true
  }

  return false
}

/**
 * Compute a simple similarity score between two strings (0–1)
 * using normalized Levenshtein distance
 */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1
  const m = a.length,
    n = b.length
  if (m === 0 || n === 0) return 0

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i]![0] = i
  for (let j = 0; j <= n; j++) dp[0]![j]! = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j]! = Math.min(
        dp[i - 1]![j]! + 1, // deletion
        dp[i]![j - 1]! + 1, // insertion
        dp[i - 1]![j - 1]! + cost, // substitution
      )
    }
  }

  const distance = dp[m]![n]!
  return 1 - distance / Math.max(m, n)
}

/**
 * Check if a title contains Christmas-related keywords
 * using accent-insensitive, case-insensitive and fuzzy matching.
 */
export function containsChristmasKeyword(title: string): boolean {
  if (!title) return false

  // Keywords: avoid overly generic ones like 'holiday' that cause false positives.
  const christmasKeywords = [
    'noel',
    'noël',
    'christmas',
    'xmas',
    'x-mas',
    'navidad',
    'natale',
    'weihnachten',
    'santa',
    'santa claus',
    'santaclaus',
    'pere noel',
    'père noël',
    'sapin',
    'advent',
    'avent',
    'réveillon',
    'calendrier de l avent',
    'calendrier',
  ]

  // 1) Normalize: lowercase + decompose accents + remove diacritics
  const normalized = title
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase like "SantaClaus" -> "Santa Claus"
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

  // 2) Create a "collapsed" version without non-alphanumerics to catch spaced/ dashed variants
  const collapsed = normalized.replace(/[^a-z0-9]/g, '') // e.g. "x mas" -> "xmas", "santaclaus" -> "santaclaus"

  // 3) Tokenize into words using Unicode letters/numbers
  const words = normalized.match(/\p{L}[\p{L}\p{N}-]*/gu) ?? []

  for (const rawKeyword of christmasKeywords) {
    const kw = rawKeyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')

    const kwCollapsed = kw.replace(/[^a-z0-9]/g, '')

    // Collapsed inclusion: catches "x mas", "x-mas", "SantaClaus", etc.
    if (kwCollapsed && collapsed.includes(kwCollapsed)) return true

    // Word-level heuristics: startsWith / include (to accept "noellish")
    for (const w of words) {
      if (w === kw) return true
      if (w.startsWith(kw) || kw.startsWith(w)) return true
    }

    // Fuzzy match (only if nothing above matched) with dynamic threshold:
    // shorter keywords allow slightly lower threshold
    const threshold = kw.length <= 4 ? 0.7 : 0.8
    for (const w of words) {
      if (stringSimilarity(w, kw) >= threshold) return true
    }
  }

  return false
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
  const { secretSanta, loading: secretSantaLoading } = useSecretSanta(eventId, {
    enabled: currentUserCanEdit && !isDismissedState,
  })

  const dismissSuggestion = useCallback(() => {
    setIsDismissedState(true)
    setDismissed(eventId)
  }, [eventId])

  const shouldShowSuggestion = useMemo(() => {
    // Must be maintainer
    if (!currentUserCanEdit) return false

    // Check if user has dismissed the suggestion
    if (isDismissedState) return false

    // Wait for secret santa to load
    if (secretSantaLoading) return false

    // Secret Santa must not exist
    if (secretSanta) return false

    // Must have event data
    if (!eventDate || !eventTitle) return false

    // Check date range: December 15 to January 1
    const eventDateFormatted = DateTime.fromISO(eventDate)

    // Check if event date is in Christmas period
    const isInChristmasPeriod = isEventInChristmasPeriod(eventDateFormatted)

    // Check title for Christmas keywords
    const hasChristmasKeyword = containsChristmasKeyword(eventTitle)

    return isInChristmasPeriod && hasChristmasKeyword
  }, [eventDate, eventTitle, secretSanta, currentUserCanEdit, isDismissedState, secretSantaLoading])

  return { shouldShowSuggestion, dismissSuggestion }
}
