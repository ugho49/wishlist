import type { FeatureFlags } from '@wishlist/common'

import { useFeatureFlagEnabled } from 'posthog-js/react'

export function useFeatureFlag(flag: FeatureFlags, defaultValue = false): boolean {
  const flagEnabled = useFeatureFlagEnabled(flag)

  return flagEnabled ?? defaultValue
}
