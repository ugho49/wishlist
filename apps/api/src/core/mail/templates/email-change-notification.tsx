import type { EmailChangeNotificationContext } from '../mail.type'

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function EmailChangeNotificationEmail({ newEmail }: EmailChangeNotificationContext) {
  return (
    <EmailLayout>
      <Section style={{ ...s.contentSection, padding: '40px 30px 30px 30px' }}>
        <Text style={s.heading}>Demande de changement d'email</Text>
        <Text style={s.paragraph}>
          Une demande de changement d'adresse email a été effectuée sur votre compte Wishlist.
        </Text>
        <Text style={s.paragraph}>
          La nouvelle adresse email demandée est : <strong>{newEmail}</strong>
        </Text>
        <Text style={s.paragraph}>
          Un email de confirmation a été envoyé à cette nouvelle adresse. Le changement ne sera effectif qu'après
          validation via le lien de confirmation.
        </Text>
      </Section>

      <Section style={s.infoSection}>
        <Text style={s.infoHeading}>Information</Text>
        <Text style={s.infoText}>
          Votre adresse email actuelle reste active jusqu'à la confirmation du changement. Vous pouvez continuer à
          utiliser votre compte normalement.
        </Text>
      </Section>

      <Section style={s.securitySection}>
        <Text style={s.securityHeading}>Vous n'avez pas demandé ce changement ?</Text>
        <Text style={s.securityText}>
          Si vous n'êtes pas à l'origine de cette demande, votre compte pourrait être compromis. Nous vous recommandons
          de :
        </Text>
        <Text style={{ ...s.securityText, paddingTop: '10px' }}>
          • Changer immédiatement votre mot de passe
          <br />• Vérifier l'activité récente de votre compte
          <br />• Ignorer l'email de confirmation (le changement ne sera pas effectué)
        </Text>
        <Text style={{ ...s.securityText, paddingTop: '10px' }}>
          Si vous ignorez l'email de confirmation, votre adresse email actuelle ne sera jamais modifiée.
        </Text>
      </Section>
    </EmailLayout>
  )
}
