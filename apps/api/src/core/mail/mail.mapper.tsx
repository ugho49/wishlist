import type { ReactElement } from 'react'

import {
  AddedToEventEmail,
  AddedToEventNewUserEmail,
  AddedToWishlistAsCoOwnerEmail,
  ConfirmEmailChangeEmail,
  EmailChangedConfirmationEmail,
  EmailChangedSuccessEmail,
  EmailChangeNotificationEmail,
  NewItemsReminderEmail,
  ResetPasswordEmail,
  SecretSantaCancelEmail,
  SecretSantaDrawEmail,
  WelcomeUserEmail,
} from '@wishlist/mail'
import { match } from 'ts-pattern'

import { MailPayload, MailTemplate } from './mail.type'

/**
 * Maps a queued mail payload to its react-email component, narrowing the
 * `context` to the right shape per template thanks to the discriminated union.
 */
export const mapPayloadToTemplate = (payload: MailPayload): ReactElement =>
  match(payload)
    .with({ template: MailTemplate.WELCOME_USER }, ({ context }) => <WelcomeUserEmail mainUrl={context.mainUrl} />)
    .with({ template: MailTemplate.RESET_PASSWORD }, ({ context }) => <ResetPasswordEmail url={context.url} />)
    .with({ template: MailTemplate.SECRET_SANTA_DRAW }, ({ context }) => (
      <SecretSantaDrawEmail
        budget={context.budget}
        description={context.description}
        eventTitle={context.eventTitle}
        eventUrl={context.eventUrl}
        secretSantaName={context.secretSantaName}
      />
    ))
    .with({ template: MailTemplate.SECRET_SANTA_CANCEL }, ({ context }) => (
      <SecretSantaCancelEmail eventTitle={context.eventTitle} eventUrl={context.eventUrl} />
    ))
    .with({ template: MailTemplate.NEW_ITEMS_REMINDER }, ({ context }) => (
      <NewItemsReminderEmail
        nbItems={context.nbItems}
        userName={context.userName}
        wishlistTitle={context.wishlistTitle}
        wishlistUrl={context.wishlistUrl}
      />
    ))
    .with({ template: MailTemplate.ADDED_TO_EVENT }, ({ context }) => (
      <AddedToEventEmail eventTitle={context.eventTitle} eventUrl={context.eventUrl} invitedBy={context.invitedBy} />
    ))
    .with({ template: MailTemplate.ADDED_TO_EVENT_NEW_USER }, ({ context }) => (
      <AddedToEventNewUserEmail
        eventTitle={context.eventTitle}
        invitedBy={context.invitedBy}
        registerUrl={context.registerUrl}
      />
    ))
    .with({ template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER }, ({ context }) => (
      <AddedToWishlistAsCoOwnerEmail
        invitedBy={context.invitedBy}
        wishlistTitle={context.wishlistTitle}
        wishlistUrl={context.wishlistUrl}
      />
    ))
    .with({ template: MailTemplate.CONFIRM_EMAIL_CHANGE }, ({ context }) => (
      <ConfirmEmailChangeEmail newEmail={context.newEmail} url={context.url} />
    ))
    .with({ template: MailTemplate.EMAIL_CHANGE_NOTIFICATION }, ({ context }) => (
      <EmailChangeNotificationEmail newEmail={context.newEmail} />
    ))
    .with({ template: MailTemplate.EMAIL_CHANGED_CONFIRMATION }, ({ context }) => (
      <EmailChangedConfirmationEmail newEmail={context.newEmail} />
    ))
    .with({ template: MailTemplate.EMAIL_CHANGED_SUCCESS }, ({ context }) => (
      <EmailChangedSuccessEmail email={context.email} />
    ))
    .exhaustive()
