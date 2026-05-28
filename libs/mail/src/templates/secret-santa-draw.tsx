import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface SecretSantaDrawEmailProps {
  readonly eventTitle: string
  readonly eventUrl: string
  readonly secretSantaName: string
  readonly budget: string
  readonly description: string
}

export default function SecretSantaDrawEmail({
  eventTitle,
  eventUrl,
  secretSantaName,
  budget,
  description,
}: SecretSantaDrawEmailProps) {
  return (
    <EmailLayout preview="Découvrez votre tirage au sort Secret Santa">
      <ContentSection>
        <Heading>🎅 Résultat du tirage Secret Santa !</Heading>
        <Paragraph style={{ textAlign: 'center' }}>Le tirage au sort a eu lieu pour l'événement :</Paragraph>
        <Paragraph style={{ ...styles.accent, textAlign: 'center', fontSize: '18px', margin: 0 }}>
          {eventTitle}
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.success.background} style={{ padding: '30px' }}>
        <Text style={{ ...styles.calloutText(styles.palette.success.text), fontSize: '16px', margin: '0 0 15px 0' }}>
          Vous devez offrir un cadeau à :
        </Text>
        <Text
          style={{
            ...styles.calloutTitle(styles.palette.success.text),
            fontSize: '28px',
            lineHeight: '34px',
            margin: 0,
          }}
        >
          🎁 {secretSantaName}
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>📋 Détails du Secret Santa :</Text>
        <Text style={{ ...styles.listItem, fontSize: '15px', lineHeight: '24px', margin: '0 0 12px 0' }}>
          <span style={styles.accent}>💰 Budget maximum :</span> {budget}
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '15px', lineHeight: '24px', margin: 0 }}>
          <span style={styles.accent}>📝 Description :</span> {description}
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 12px 0' }}>
          💡 Conseils pour votre cadeau :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • Consultez la liste de souhaits de cette personne pour trouver l'inspiration
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • Respectez le budget maximum indiqué ci-dessus
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          • Gardez le secret jusqu'à l'échange des cadeaux !
        </Text>
      </Section>

      <Callout background={styles.palette.warning.background}>
        <Text style={styles.calloutTitle(styles.palette.warning.text)}>🤫 Rappel important</Text>
        <Text style={styles.calloutText(styles.palette.warning.text)}>
          Ne révélez à personne qui est votre Secret Santa ! C'est le principe du jeu. Consultez la liste de la personne
          tirée au sort pour vous inspirer.
        </Text>
      </Callout>

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Cliquez sur le bouton ci-dessous pour voir la liste de souhaits et toutes les informations de l'événement :
        </Paragraph>
        <PrimaryButton href={eventUrl}>Voir la liste de {secretSantaName}</PrimaryButton>
        <ButtonFallback href={eventUrl} />
      </Section>
    </EmailLayout>
  )
}

SecretSantaDrawEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
  secretSantaName: 'Marie Dupont',
  budget: '30,00 €',
  description: 'Cadeaux faits maison appréciés',
} satisfies SecretSantaDrawEmailProps
