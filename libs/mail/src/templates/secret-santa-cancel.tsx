import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface SecretSantaCancelEmailProps {
  readonly eventTitle: string
  readonly eventUrl: string
}

export default function SecretSantaCancelEmail({ eventTitle, eventUrl }: SecretSantaCancelEmailProps) {
  return (
    <EmailLayout preview="Le Secret Santa de votre événement a été annulé">
      <ContentSection>
        <Heading>Annulation du Secret Santa</Heading>
        <Paragraph style={{ margin: 0 }}>
          Nous vous informons que l'organisateur de l'événement a décidé d'annuler le Secret Santa pour :
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.danger.background}>
        <Text
          style={{
            ...styles.calloutTitle(styles.palette.danger.text),
            fontSize: '22px',
            lineHeight: '28px',
            margin: 0,
          }}
        >
          ❌ {eventTitle}
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Qu'est-ce que cela signifie ?</Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>•</span> Le tirage au sort Secret Santa a été annulé
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>•</span> Vous n'avez plus besoin d'acheter de cadeau dans le cadre du Secret Santa
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <span style={styles.accent}>•</span> L'événement reste actif et vous pouvez toujours consulter les listes de
          souhaits
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 10px 0' }}>
          ℹ️ Bon à savoir :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          L'annulation du Secret Santa n'affecte pas l'événement en lui-même. Vous pouvez continuer à gérer vos listes
          de souhaits, consulter celles des autres participants et réserver des cadeaux normalement.
        </Text>
      </Section>

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Vous pouvez toujours accéder à votre événement et aux listes de souhaits :
        </Paragraph>
        <PrimaryButton href={eventUrl}>Accéder à l'événement</PrimaryButton>
        <ButtonFallback href={eventUrl} />
      </Section>
    </EmailLayout>
  )
}

SecretSantaCancelEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
} satisfies SecretSantaCancelEmailProps
