import type { SecretSantaCancelContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function SecretSantaCancelEmail({ eventTitle, eventUrl }: SecretSantaCancelContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Annulation du Secret Santa</Text>
        <Text style={s.paragraph}>
          Nous vous informons que l'organisateur de l'événement a décidé d'annuler le Secret Santa pour :
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgRed)}>
        <Text style={s.highlightText(s.colors.textRed)}>{eventTitle}</Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Qu'est-ce que cela signifie ?</Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>•</strong> Le tirage au sort Secret Santa a été annulé
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>•</strong> Vous n'avez plus besoin d'acheter de cadeau dans le
          cadre du Secret Santa
        </Text>
        <Text style={{ ...s.listItem, paddingBottom: 0 }}>
          <strong style={{ color: s.colors.primary }}>•</strong> L'événement reste actif et vous pouvez toujours
          consulter les listes de souhaits
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Bon à savoir :</Text>
        <Text style={s.tipText}>
          L'annulation du Secret Santa n'affecte pas l'événement en lui-même. Vous pouvez continuer à gérer vos listes
          de souhaits, consulter celles des autres participants et réserver des cadeaux normalement.
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Text style={{ ...s.paragraph, textAlign: 'center', paddingBottom: '20px' }}>
          Vous pouvez toujours accéder à votre événement et aux listes de souhaits :
        </Text>
        <Button href={eventUrl} style={s.button}>
          Accéder à l'événement
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
