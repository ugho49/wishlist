import type { EmailChangedSuccessContext } from '../mail.type'

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function EmailChangedSuccessEmail({ email }: EmailChangedSuccessContext) {
  return (
    <EmailLayout>
      <Section style={{ ...s.contentSection, padding: '40px 30px 30px 30px' }}>
        <Text style={s.heading}>Bienvenue sur votre nouveau email !</Text>
        <Text style={s.paragraph}>Félicitations ! Votre adresse email a été mise à jour avec succès.</Text>
        <Text style={s.paragraph}>
          Votre nouvelle adresse email : <strong>{email}</strong>
        </Text>
        <Text style={s.paragraph}>
          Utilisez désormais cette adresse pour vous connecter à votre compte Wishlist et recevoir toutes les
          notifications.
        </Text>
      </Section>

      <Section style={s.successSection}>
        <Text style={s.successHeading}>Changement confirmé</Text>
        <Text style={s.successText}>
          Toutes les futures notifications et communications de Wishlist seront envoyées à cette nouvelle adresse email.
        </Text>
      </Section>

      <Section style={s.securitySection}>
        <Text style={s.securityHeading}>À retenir</Text>
        <Text style={s.securityText}>
          • Votre ancien email n'est plus associé à votre compte
          <br />• Utilisez votre nouvelle adresse pour vous connecter
          <br />• Vos listes de souhaits et événements restent inchangés
          <br />• Vos préférences de notification sont conservées
        </Text>
      </Section>
    </EmailLayout>
  )
}
