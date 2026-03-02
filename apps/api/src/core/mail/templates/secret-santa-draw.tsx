import type { SecretSantaDrawContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function SecretSantaDrawEmail({
  eventTitle,
  eventUrl,
  secretSantaName,
  budget,
  description,
}: SecretSantaDrawContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Résultat du tirage Secret Santa !</Text>
        <Text style={{ ...s.paragraph, textAlign: 'center' }}>Le tirage au sort a eu lieu pour l'événement :</Text>
        <Text
          style={{
            ...s.paragraph,
            textAlign: 'center',
            color: s.colors.primary,
            fontSize: '18px',
            fontWeight: 'bold',
            paddingBottom: '25px',
          }}
        >
          {eventTitle}
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgGreen)}>
        <Text
          style={{
            color: s.colors.textGreen,
            fontSize: '16px',
            lineHeight: '22px',
            textAlign: 'center',
            padding: '0 0 15px 0',
            margin: 0,
          }}
        >
          Vous devez offrir un cadeau à :
        </Text>
        <Text
          style={{
            color: s.colors.textGreen,
            fontSize: '28px',
            lineHeight: '34px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {secretSantaName}
        </Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Détails du Secret Santa :</Text>
        <Text style={{ ...s.listItem, paddingBottom: '12px' }}>
          <span style={{ color: s.colors.primary, fontWeight: 'bold' }}>Budget maximum :</span> {budget}
        </Text>
        <Text style={{ ...s.listItem, paddingBottom: '20px' }}>
          <span style={{ color: s.colors.primary, fontWeight: 'bold' }}>Description :</span> {description}
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Conseils pour votre cadeau :</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          • Consultez la liste de souhaits de cette personne pour trouver l'inspiration
        </Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>• Respectez le budget maximum indiqué ci-dessus</Text>
        <Text style={s.tipText}>• Gardez le secret jusqu'à l'échange des cadeaux !</Text>
      </Section>

      <Section style={s.warningSection}>
        <Text style={s.warningHeading}>Rappel important</Text>
        <Text style={s.warningText}>
          Ne révélez à personne qui est votre Secret Santa ! C'est le principe du jeu. Consultez la liste de la personne
          tirée au sort pour vous inspirer.
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Text style={{ ...s.paragraph, textAlign: 'center', paddingBottom: '20px' }}>
          Cliquez sur le bouton ci-dessous pour voir la liste de souhaits et toutes les informations de l'événement :
        </Text>
        <Button href={eventUrl} style={s.button}>
          Voir la liste de {secretSantaName}
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
