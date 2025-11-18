export enum MailTemplate {
  WELCOME_USER = 'welcome-user',
  SECRET_SANTA_DRAW = 'secret-santa-draw',
  SECRET_SANTA_CANCEL = 'secret-santa-cancel',
  RESET_PASSWORD = 'reset-password',
  NEW_ITEMS_REMINDER = 'new-items-reminder',
  ADDED_TO_EVENT = 'added-to-event',
  ADDED_TO_WISHLIST_AS_CO_OWNER = 'added-to-wishlist-as-co-owner',
  ADDED_TO_EVENT_NEW_USER = 'added-to-event-new-user',
  CONFIRM_EMAIL_CHANGE = 'confirm-email-change',
  EMAIL_CHANGE_NOTIFICATION = 'email-change-notification',
  EMAIL_CHANGED_CONFIRMATION = 'email-changed-confirmation',
  EMAIL_CHANGED_SUCCESS = 'email-changed-success',
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

export type ConfirmEmailChangeContext = {
  url: string
  newEmail: string
}

export type EmailChangeNotificationContext = {
  newEmail: string
}

export type EmailChangedConfirmationContext = {
  newEmail: string
}

export type EmailChangedSuccessContext = {
  email: string
}

type BaseMailPayload = {
  to: string | string[]
  subject: string
}

export type MailPayload = BaseMailPayload &
  (
    | {
        template: MailTemplate.WELCOME_USER
        context: WelcomeUserContext
      }
    | {
        template: MailTemplate.SECRET_SANTA_DRAW
        context: SecretSantaDrawContext
      }
    | {
        template: MailTemplate.SECRET_SANTA_CANCEL
        context: SecretSantaCancelContext
      }
    | {
        template: MailTemplate.RESET_PASSWORD
        context: ResetPasswordContext
      }
    | {
        template: MailTemplate.NEW_ITEMS_REMINDER
        context: NewItemsReminderContext
      }
    | {
        template: MailTemplate.ADDED_TO_EVENT
        context: AddedToEventContext
      }
    | {
        template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER
        context: AddedToWishlistAsCoOwnerContext
      }
    | {
        template: MailTemplate.ADDED_TO_EVENT_NEW_USER
        context: AddedToEventNewUserContext
      }
    | {
        template: MailTemplate.CONFIRM_EMAIL_CHANGE
        context: ConfirmEmailChangeContext
      }
    | {
        template: MailTemplate.EMAIL_CHANGE_NOTIFICATION
        context: EmailChangeNotificationContext
      }
    | {
        template: MailTemplate.EMAIL_CHANGED_CONFIRMATION
        context: EmailChangedConfirmationContext
      }
    | {
        template: MailTemplate.EMAIL_CHANGED_SUCCESS
        context: EmailChangedSuccessContext
      }
  )
