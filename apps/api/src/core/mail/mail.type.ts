export enum MailTemplate {
  WELCOME_USER = 'welcome-user',
  SECRET_SANTA_DRAW = 'secret-santa-draw',
  SECRET_SANTA_CANCEL = 'secret-santa-cancel',
  RESET_PASSWORD = 'reset-password',
  NEW_ITEMS_REMINDER = 'new-items-reminder',
  ADDED_TO_EVENT = 'added-to-event',
  ADDED_TO_WISHLIST_AS_CO_OWNER = 'added-to-wishlist-as-co-owner',
  ADDED_TO_EVENT_NEW_USER = 'added-to-event-new-user',
}

export type WelcomeUserContext = {
  mainUrl: string
}

export type SecretSantaDrawContext = {
  eventTitle: string
  eventUrl: string
  secretSantaName: string
  budget: string
  description: string
}

export type SecretSantaCancelContext = {
  eventTitle: string
  eventUrl: string
}

export type ResetPasswordContext = {
  url: string
}

export type NewItemsReminderContext = {
  wishlistTitle: string
  wishlistUrl: string
  nbItems: number
  userName: string
}

export type AddedToEventContext = {
  eventTitle: string
  eventUrl: string
  invitedBy: string
}

export type AddedToWishlistAsCoOwnerContext = {
  wishlistTitle: string
  wishlistUrl: string
  invitedBy: string
}

export type AddedToEventNewUserContext = {
  eventTitle: string
  registerUrl: string
  invitedBy: string
}

export type MailPayload =
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.WELCOME_USER
      context: WelcomeUserContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.SECRET_SANTA_DRAW
      context: SecretSantaDrawContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.SECRET_SANTA_CANCEL
      context: SecretSantaCancelContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.RESET_PASSWORD
      context: ResetPasswordContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.NEW_ITEMS_REMINDER
      context: NewItemsReminderContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.ADDED_TO_EVENT
      context: AddedToEventContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER
      context: AddedToWishlistAsCoOwnerContext
    }
  | {
      to: string | string[]
      subject: string
      template: MailTemplate.ADDED_TO_EVENT_NEW_USER
      context: AddedToEventNewUserContext
    }
