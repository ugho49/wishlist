import { Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { Callout, ContentSection, Heading, Paragraph } from '../components/ui'
import * as styles from '../styles'

export interface EmailChangeNotificationEmailProps {
  readonly newEmail: string
}

export default function EmailChangeNotificationEmail({ newEmail }: EmailChangeNotificationEmailProps) {
  return (
    <EmailLayout preview="Une demande de changement d'email a été effectuée">
      <ContentSection style={{ padding: '40px 30px 30px 30px' }}>
        <Heading>Demande de changement d'email 🔔</Heading>
        <Paragraph>Une demande de changement d'adresse email a été effectuée sur votre compte Wishlist.</Paragraph>
        <Paragraph>
          La nouvelle adresse email demandée est : <strong>{newEmail}</strong>
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Un email de confirmation a été envoyé à cette nouvelle adresse. Le changement ne sera effectif qu'après
          validation via le lien de confirmation.
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.info.background}>
        <Text style={styles.calloutTitle(styles.palette.info.text)}>ℹ️ Information</Text>
        <Text style={styles.calloutText(styles.palette.info.text)}>
          Votre adresse email actuelle reste active jusqu'à la confirmation du changement. Vous pouvez continuer à
          utiliser votre compte normalement.
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 35px 30px' }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px' }}>
          🔒 Vous n'avez pas demandé ce changement ?
        </Text>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          Si vous n'êtes pas à l'origine de cette demande, votre compte pourrait être compromis. Nous vous recommandons
          de :
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: '10px 0 0 0' }}>
          • Changer immédiatement votre mot de passe
          <br />• Vérifier l'activité récente de votre compte
          <br />• Ignorer l'email de confirmation (le changement ne sera pas effectué)
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: '10px 0 0 0' }}>
          Si vous ignorez l'email de confirmation, votre adresse email actuelle ne sera jamais modifiée.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  )
}

EmailChangeNotificationEmail.PreviewProps = {
  newEmail: 'nouvelle.adresse@example.com',
} satisfies EmailChangeNotificationEmailProps
