import { Link, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface ResetPasswordEmailProps {
  readonly url: string
}

export default function ResetPasswordEmail({ url }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Réinitialisation de votre mot de passe Wishlist">
      <ContentSection style={{ padding: '40px 30px 30px 30px' }}>
        <Heading>Réinitialisation de mot de passe 🔑</Heading>
        <Paragraph style={{ margin: 0 }}>
          Vous avez demandé à réinitialiser votre mot de passe pour votre compte Wishlist. Cliquez sur le bouton
          ci-dessous pour créer un nouveau mot de passe.
        </Paragraph>
      </ContentSection>

      <Section style={{ backgroundColor: styles.colors.white, padding: '10px 30px 30px 30px', textAlign: 'center' }}>
        <PrimaryButton href={url}>Réinitialiser mon mot de passe</PrimaryButton>
        <Text style={styles.buttonHint}>
          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
        </Text>
        <Text style={{ ...styles.buttonHint, color: styles.colors.primary, margin: '5px 0 0 0' }}>
          <Link href={url} style={{ color: styles.colors.primary, wordBreak: 'break-all' }}>
            {url}
          </Link>
        </Text>
      </Section>

      <Callout background={styles.palette.warning.background}>
        <Text style={styles.calloutTitle(styles.palette.warning.text)}>
          ⏱️ Attention : Ce lien expire dans 15 minutes
        </Text>
        <Text style={styles.calloutText(styles.palette.warning.text)}>
          Pour des raisons de sécurité, ce lien de réinitialisation n'est valide que pendant 15 minutes. Passé ce délai,
          vous devrez faire une nouvelle demande.
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 35px 30px' }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px' }}>
          🔒 Vous n'avez pas demandé cette réinitialisation ?
        </Text>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot
          de passe actuel restera inchangé et votre compte est protégé.
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '21px', margin: '10px 0 0 0' }}>
          Nous vous recommandons toutefois de vérifier l'activité récente de votre compte si vous recevez régulièrement
          ce type de message.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  )
}

ResetPasswordEmail.PreviewProps = {
  url: 'https://wishlistapp.fr/reset-password?token=preview',
} satisfies ResetPasswordEmailProps
