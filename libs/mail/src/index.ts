// Render helper from react-email — single entry point for turning a template into HTML.
export { render } from '@react-email/components'

export { EmailLayout } from './components/layout'
export { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from './components/ui'
// Shared building blocks (exposed so the preview server and consumers can reuse them).
export * from './styles'
export { type AddedToEventEmailProps, default as AddedToEventEmail } from './templates/added-to-event'
export {
  type AddedToEventNewUserEmailProps,
  default as AddedToEventNewUserEmail,
} from './templates/added-to-event-new-user'
export {
  type AddedToWishlistAsCoOwnerEmailProps,
  default as AddedToWishlistAsCoOwnerEmail,
} from './templates/added-to-wishlist-as-co-owner'
export {
  type ConfirmEmailChangeEmailProps,
  default as ConfirmEmailChangeEmail,
} from './templates/confirm-email-change'
export {
  default as EmailChangeNotificationEmail,
  type EmailChangeNotificationEmailProps,
} from './templates/email-change-notification'
export {
  default as EmailChangedConfirmationEmail,
  type EmailChangedConfirmationEmailProps,
} from './templates/email-changed-confirmation'
export {
  default as EmailChangedSuccessEmail,
  type EmailChangedSuccessEmailProps,
} from './templates/email-changed-success'
export { default as NewItemsReminderEmail, type NewItemsReminderEmailProps } from './templates/new-items-reminder'
export { default as ResetPasswordEmail, type ResetPasswordEmailProps } from './templates/reset-password'
export { default as SecretSantaCancelEmail, type SecretSantaCancelEmailProps } from './templates/secret-santa-cancel'
export { default as SecretSantaDrawEmail, type SecretSantaDrawEmailProps } from './templates/secret-santa-draw'
// Templates — named re-exports of the default-exported components so the
// backend mapper can import them by name. The default exports are kept for the
// `react-email` preview server (which discovers templates by file).
export { default as WelcomeUserEmail, type WelcomeUserEmailProps } from './templates/welcome-user'
