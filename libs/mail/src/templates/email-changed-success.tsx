import { Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { Callout, ContentSection, Heading, Paragraph } from '../components/ui'
import * as styles from '../styles'

export interface EmailChangedSuccessEmailProps {
  readonly email: string
}

export default function EmailChangedSuccessEmail({ email }: EmailChangedSuccessEmailProps) {
  return (
    <EmailLayout preview="Bienvenue sur votre nouvelle adresse email Wishlist">
      <ContentSection style={{ padding: '40px 30px 30px 30px' }}>
        <Heading>Bienvenue sur votre nouveau email ! 🎉</Heading>
        <Paragraph>Félicitations ! Votre adresse email a été mise à jour avec succès.</Paragraph>
        <Paragraph>
          Votre nouvelle adresse email : <strong>{email}</strong>
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Utilisez désormais cette adresse pour vous connecter à votre compte Wishlist et recevoir toutes les
          notifications.
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.success.background}>
        <Text style={styles.calloutTitle(styles.palette.success.text)}>✅ Changement confirmé</Text>
        <Text style={styles.calloutText(styles.palette.success.text)}>
          Toutes les futures notifications et communications de Wishlist seront envoyées à cette nouvelle adresse email.
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 35px 30px' }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px' }}>📌 À retenir</Text>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          • Votre ancien email n'est plus associé à votre compte
          <br />• Utilisez votre nouvelle adresse pour vous connecter
          <br />• Vos listes de souhaits et événements restent inchangés
          <br />• Vos préférences de notification sont conservées
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  )
}

EmailChangedSuccessEmail.PreviewProps = {
  email: 'nouvelle.adresse@example.com',
} satisfies EmailChangedSuccessEmailProps
