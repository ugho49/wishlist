import { useFeatureFlagEnabled } from 'posthog-js/react'

export enum FEATURE_FLAGS {
  MAINTENACE_PAGE_ENABLED = 'frontend-maintenance-page-enabled',
  SECRET_SANTA_ENABLED = 'frontend-beta-feature-secret-santa',
}

export function useFeatureFlag(flagName: FEATURE_FLAGS, defaultValue = false) {
  const flagEnabled = useFeatureFlagEnabled(flagName)
  return flagEnabled ?? defaultValue
}
