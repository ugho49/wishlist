import type { RootState } from '../core'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { OnboardingService } from '../core/services/onboarding.service'
import { useFetchUserInfo } from './domain/useFetchUserInfo'

const mapState = (state: RootState) => ({
  pictureUrl: state.userProfile.pictureUrl,
  userId: state.auth.user?.id,
})

export const useProfilePicturePrompt = () => {
  const { user } = useFetchUserInfo()
  const { pictureUrl, userId } = useSelector(mapState)
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)

  useEffect(() => {
    if (!userId) {
      return
    }

    const onboardingService = new OnboardingService(userId)

    // Don't show prompt if:
    // - User is not loaded yet
    // - User already has a profile picture
    // - We've already shown the prompt
    if (!user || onboardingService.isSetProfilePictureAsBeenShown()) {
      return
    }

    if (pictureUrl) {
      // We don't want to show the prompt if the user already has a profile picture and decide to remove it afterwards
      onboardingService.markSetProfilePictureAsShown()
      return
    }

    // Show prompt only for users without profile pictures
    // and after a short delay to avoid interrupting initial loading
    const timer = setTimeout(() => {
      setShouldShowPrompt(true)
      // We mark the prompt as shown to avoid showing it again
      onboardingService.markSetProfilePictureAsShown()
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [user, pictureUrl, userId])

  const handlePromptClosed = () => {
    setShouldShowPrompt(false)
  }

  return {
    shouldShowPrompt,
    handlePromptClosed,
  }
}
