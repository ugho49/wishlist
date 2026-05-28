import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface AddedToEventNewUserEmailProps {
  readonly eventTitle: string
  readonly registerUrl: string
  readonly invitedBy: string
}

export default function AddedToEventNewUserEmail({
  eventTitle,
  registerUrl,
  invitedBy,
}: AddedToEventNewUserEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous invite à rejoindre Wishlist`}>
      <ContentSection>
        <Heading>Vous êtes invité(e) ! 🎉</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{invitedBy}</b> vous a ajouté(e) en tant que participant(e) à un événement sur Wishlist :
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
        <Text style={styles.sectionTitle}>Qu'est-ce que Wishlist ?</Text>
        <Paragraph style={{ fontSize: '15px', lineHeight: '22px' }}>
          Wishlist est une plateforme gratuite qui vous permet de partager vos souhaits avec vos proches et de découvrir
          les leurs. Plus besoin de se demander quoi offrir !
        </Paragraph>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Créez vos listes de souhaits</b> pour chaque événement
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Consultez les listes</b> de vos amis et famille
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>✓</span> <b>Réservez des cadeaux</b> en toute discrétion
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <span style={styles.accent}>✓</span> <b>Organisez des Secret Santa</b> facilement
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 10px 0' }}>
          🎁 Pourquoi rejoindre ?
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • <b>Gratuit et sans publicité</b>
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • <b>Simple et rapide</b> à utiliser
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          • <b>Vos proches sauront</b> exactement quoi vous offrir
        </Text>
      </Section>

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Créez votre compte gratuitement pour participer à cet événement :
        </Paragraph>
        <PrimaryButton href={registerUrl}>Créer mon compte gratuitement</PrimaryButton>
        <ButtonFallback href={registerUrl} />
      </Section>
    </EmailLayout>
  )
}

AddedToEventNewUserEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  registerUrl: 'https://wishlistapp.fr/register?invitation=preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToEventNewUserEmailProps
