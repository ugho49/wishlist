import type { DrizzleDatabase } from '@wishlist/api/core'
import type { UserId } from '@wishlist/common'

import { schema } from '@wishlist/api-drizzle'
import { eq } from 'drizzle-orm'

import { ADMIN_USER_EMAIL, BASE_USER_EMAIL, type SignedAs } from './constants'
import { createEventFactory } from './event.factory'
import { createEventAttendeeFactory } from './event-attendee.factory'
import { createItemFactory } from './item.factory'
import { createSecretSantaFactory } from './secret-santa.factory'
import { createSecretSantaUserFactory } from './secret-santa-user.factory'
import { createUserFactory } from './user.factory'
import { createUserEmailChangeVerificationFactory } from './user-email-change-verification.factory'
import { createUserEmailSettingFactory } from './user-email-setting.factory'
import { createUserPasswordVerificationFactory } from './user-password-verification.factory'
import { createWishlistFactory } from './wishlist.factory'

export class Factories {
  readonly user: ReturnType<typeof createUserFactory>
  readonly event: ReturnType<typeof createEventFactory>
  readonly eventAttendee: ReturnType<typeof createEventAttendeeFactory>
  readonly wishlist: ReturnType<typeof createWishlistFactory>
  readonly item: ReturnType<typeof createItemFactory>
  readonly secretSanta: ReturnType<typeof createSecretSantaFactory>
  readonly secretSantaUser: ReturnType<typeof createSecretSantaUserFactory>
  readonly userEmailSetting: ReturnType<typeof createUserEmailSettingFactory>
  readonly userPasswordVerification: ReturnType<typeof createUserPasswordVerificationFactory>
  readonly userEmailChangeVerification: ReturnType<typeof createUserEmailChangeVerificationFactory>

  constructor(private readonly db: DrizzleDatabase) {
    this.user = createUserFactory(db)
    this.event = createEventFactory(db)
    this.eventAttendee = createEventAttendeeFactory(db)
    this.wishlist = createWishlistFactory(db)
    this.item = createItemFactory(db)
    this.secretSanta = createSecretSantaFactory(db)
    this.secretSantaUser = createSecretSantaUserFactory(db)
    this.userEmailSetting = createUserEmailSettingFactory(db)
    this.userPasswordVerification = createUserPasswordVerificationFactory(db)
    this.userEmailChangeVerification = createUserEmailChangeVerificationFactory(db)
  }

  async getSignedUserId(signedAs: SignedAs): Promise<UserId> {
    const email = signedAs === 'BASE_USER' ? BASE_USER_EMAIL : ADMIN_USER_EMAIL

    const user = await this.db.query.user.findFirst({
      columns: { id: true },
      where: eq(schema.user.email, email),
    })

    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }

    return user.id
  }
}

export * from './constants'
export * from './event.factory'
export * from './event-attendee.factory'
export * from './item.factory'
export * from './secret-santa.factory'
export * from './secret-santa-user.factory'
export * from './user.factory'
export * from './user-email-change-verification.factory'
export * from './user-email-setting.factory'
export * from './user-password-verification.factory'
export * from './wishlist.factory'
