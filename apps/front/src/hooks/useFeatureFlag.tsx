import type { FeatureFlags } from '@wishlist/common'

import { useFlags } from 'launchdarkly-react-client-sdk'

export function useFeatureFlag(flag: FeatureFlags, defaultValue = false): boolean {
  const flags = useFlags()

  return flags[flag] ?? defaultValue
}
