import type { ConfirmEmailChangeContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function ConfirmEmailChangeEmail({ url, newEmail }: ConfirmEmailChangeContext) {
  return (
    <EmailLayout>
      <Section style={{ ...s.contentSection, padding: '40px 30px 30px 30px' }}>
        <Text style={s.heading}>Confirmation de changement d'email</Text>
        <Text style={s.paragraph}>
          Vous avez demandé à changer l'adresse email de votre compte Wishlist pour <strong>{newEmail}</strong>.
        </Text>
        <Text style={s.paragraph}>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</Text>
      </Section>

      <Section style={{ ...s.ctaSection, padding: '10px 30px 30px 30px' }}>
        <Button href={url} style={s.button}>
          Confirmer le changement d'email
        </Button>
        <Text style={s.fallbackLink}>
          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
        </Text>
        <Text style={{ ...s.fallbackLink, padding: '5px 0 0 0' }}>
          <Link href={url} style={{ ...s.link, fontSize: '12px', wordBreak: 'break-all' }}>
            {url}
          </Link>
        </Text>
      </Section>

      <Section style={s.warningSection}>
        <Text style={s.warningHeading}>Attention : Ce lien expire dans 15 minutes</Text>
        <Text style={s.warningText}>
          Pour des raisons de sécurité, ce lien de confirmation n'est valide que pendant 15 minutes. Passé ce délai,
          vous devrez faire une nouvelle demande.
        </Text>
      </Section>

      <Section style={s.securitySection}>
        <Text style={s.securityHeading}>Vous n'avez pas demandé ce changement ?</Text>
        <Text style={s.securityText}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre
          adresse email actuelle restera inchangée et votre compte est protégé.
        </Text>
        <Text style={{ ...s.securityText, paddingTop: '10px' }}>
          Nous vous recommandons toutefois de vérifier l'activité récente de votre compte si vous recevez régulièrement
          ce type de message.
        </Text>
      </Section>
    </EmailLayout>
  )
}
