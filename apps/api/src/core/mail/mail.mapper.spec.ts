import { render } from '@wishlist/mail'

import { mapPayloadToTemplate } from './mail.mapper'
import { MailPayload, MailTemplate } from './mail.type'

const base = { to: 'test@test.fr', subject: 'Test' }

// One payload per template so every react-email component is rendered at least once.
const payloads: MailPayload[] = [
  { ...base, template: MailTemplate.WELCOME_USER, context: { mainUrl: 'https://wishlistapp.fr' } },
  { ...base, template: MailTemplate.RESET_PASSWORD, context: { url: 'https://wishlistapp.fr/reset' } },
  {
    ...base,
    template: MailTemplate.SECRET_SANTA_DRAW,
    context: {
      eventTitle: 'Noël',
      eventUrl: 'https://x/e',
      secretSantaName: 'Marie',
      budget: '30 €',
      description: 'X',
    },
  },
  { ...base, template: MailTemplate.SECRET_SANTA_CANCEL, context: { eventTitle: 'Noël', eventUrl: 'https://x/e' } },
  {
    ...base,
    template: MailTemplate.NEW_ITEMS_REMINDER,
    context: { wishlistTitle: 'Liste', wishlistUrl: 'https://x/w', nbItems: 3, userName: 'Jean' },
  },
  {
    ...base,
    template: MailTemplate.ADDED_TO_EVENT,
    context: { eventTitle: 'Noël', eventUrl: 'https://x/e', invitedBy: 'Marie' },
  },
  {
    ...base,
    template: MailTemplate.ADDED_TO_EVENT_NEW_USER,
    context: { eventTitle: 'Noël', registerUrl: 'https://x/r', invitedBy: 'Marie' },
  },
  {
    ...base,
    template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER,
    context: { wishlistTitle: 'Liste', wishlistUrl: 'https://x/w', invitedBy: 'Marie' },
  },
  {
    ...base,
    template: MailTemplate.CONFIRM_EMAIL_CHANGE,
    context: { url: 'https://x/c', newEmail: 'new@test.fr' },
  },
  { ...base, template: MailTemplate.EMAIL_CHANGE_NOTIFICATION, context: { newEmail: 'new@test.fr' } },
  { ...base, template: MailTemplate.EMAIL_CHANGED_CONFIRMATION, context: { newEmail: 'new@test.fr' } },
  { ...base, template: MailTemplate.EMAIL_CHANGED_SUCCESS, context: { email: 'new@test.fr' } },
]

describe('mapPayloadToTemplate', () => {
  it('maps every MailTemplate value to a payload (exhaustive coverage)', () => {
    const covered = new Set(payloads.map(p => p.template))
    expect(covered).toEqual(new Set(Object.values(MailTemplate)))
  })

  it.each(payloads.map(p => [p.template, p] as const))('renders %s to non-empty html', async (_template, payload) => {
    const html = await render(mapPayloadToTemplate(payload))

    expect(html).toContain('<html')
    expect(html).toContain('Wishlist')
  })
})
