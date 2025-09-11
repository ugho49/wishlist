import type { UserId } from '@wishlist/common'

const LS_ONBOARDING_PREFIX = 'wl_onboarding_'

type OnboardingKeys = {
  isSetProfilePictureAsBeenShown?: boolean
}

export class OnboardingService {
  private readonly lsKey: string

  constructor(private readonly userId: UserId) {
    this.lsKey = `${LS_ONBOARDING_PREFIX}${this.userId}`
  }

  isSetProfilePictureAsBeenShown() {
    const value = this.readValue().isSetProfilePictureAsBeenShown
    return value === true
  }

  markSetProfilePictureAsShown() {
    const values = this.readValue()
    values.isSetProfilePictureAsBeenShown = true
    localStorage.setItem(this.lsKey, JSON.stringify(values))
  }

  private readValue(): OnboardingKeys {
    return (JSON.parse(localStorage.getItem(this.lsKey) || '{}') || {}) as OnboardingKeys
  }
}
