import type { EmailChangedConfirmationContext } from '../mail.type'

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function EmailChangedConfirmationEmail({ newEmail }: EmailChangedConfirmationContext) {
  return (
    <EmailLayout>
      <Section style={{ ...s.contentSection, padding: '40px 30px 30px 30px' }}>
        <Text style={s.heading}>Votre email a été modifié</Text>
        <Text style={s.paragraph}>
          Nous vous confirmons que l'adresse email de votre compte Wishlist a été modifiée avec succès.
        </Text>
        <Text style={s.paragraph}>
          Nouvelle adresse email : <strong>{newEmail}</strong>
        </Text>
        <Text style={s.paragraph}>
          À partir de maintenant, utilisez cette nouvelle adresse pour vous connecter à votre compte.
        </Text>
      </Section>

      <Section style={s.successSection}>
        <Text style={s.successHeading}>Changement effectué</Text>
        <Text style={s.successText}>
          Cette adresse email n'est plus associée à votre compte Wishlist. Un email de confirmation a été envoyé à votre
          nouvelle adresse.
        </Text>
      </Section>

      <Section style={s.securitySection}>
        <Text style={s.securityHeading}>Vous n'avez pas effectué ce changement ?</Text>
        <Text style={s.securityText}>
          Si vous n'êtes pas à l'origine de ce changement, votre compte a été compromis. Contactez-nous immédiatement
          pour récupérer l'accès à votre compte.
        </Text>
        <Text style={{ ...s.securityText, paddingTop: '10px' }}>
          Note : Cette ancienne adresse email ne recevra plus les notifications de votre compte Wishlist.
        </Text>
      </Section>
    </EmailLayout>
  )
}
