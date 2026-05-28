import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface AddedToEventEmailProps {
  readonly eventTitle: string
  readonly eventUrl: string
  readonly invitedBy: string
}

export default function AddedToEventEmail({ eventTitle, eventUrl, invitedBy }: AddedToEventEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous a invité(e) à un événement sur Wishlist`}>
      <ContentSection>
        <Heading>Nouvelle invitation à un événement ! 🎊</Heading>
        <Paragraph style={{ margin: 0 }}>
          Bonne nouvelle ! <b>{invitedBy}</b> vous a ajouté(e) en tant que participant(e) à l'événement :
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.event.background}>
        <Text
          style={{ ...styles.calloutTitle(styles.palette.event.text), fontSize: '22px', lineHeight: '28px', margin: 0 }}
        >
          📅 {eventTitle}
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Ce que vous pouvez faire maintenant :</Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Créer votre liste de souhaits</b> pour cet événement
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Consulter les listes</b> des autres participants
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Réserver des cadeaux</b> pour vos proches
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <span style={styles.accent}>✓</span> <b>Participer au Secret Santa</b> si organisé
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 10px 0' }}>
          💡 Conseil :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          Plus vous ajoutez d'éléments à votre liste, plus il sera facile pour vos proches de vous faire plaisir !
          N'hésitez pas à varier les prix et à être précis dans vos descriptions.
        </Text>
      </Section>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={eventUrl}>Accéder à l'événement</PrimaryButton>
        <ButtonFallback href={eventUrl} />
      </Section>
    </EmailLayout>
  )
}

AddedToEventEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToEventEmailProps
