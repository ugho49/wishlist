import type { AddedToEventContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function AddedToEventEmail({ eventTitle, eventUrl, invitedBy }: AddedToEventContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Nouvelle invitation à un événement !</Text>
        <Text style={s.paragraph}>
          Bonne nouvelle ! <strong>{invitedBy}</strong> vous a ajouté(e) en tant que participant(e) à l'événement :
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgBlue)}>
        <Text style={s.highlightText(s.colors.primary)}>{eventTitle}</Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Ce que vous pouvez faire maintenant :</Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Créer votre liste de souhaits</strong> pour cet
          événement
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Consulter les listes</strong> des autres
          participants
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Réserver des cadeaux</strong> pour vos proches
        </Text>
        <Text style={{ ...s.listItem, paddingBottom: 0 }}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Participer au Secret Santa</strong> si organisé
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Conseil :</Text>
        <Text style={s.tipText}>
          Plus vous ajoutez d'éléments à votre liste, plus il sera facile pour vos proches de vous faire plaisir !
          N'hésitez pas à varier les prix et à être précis dans vos descriptions.
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Button href={eventUrl} style={s.button}>
          Accéder à l'événement
        </Button>
        <Text style={s.fallbackLink}>
          Si le bouton ne fonctionne pas, copiez ce lien :{' '}
          <Link href={eventUrl} style={s.link}>
            {eventUrl}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  )
}
