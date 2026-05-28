import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface NewItemsReminderEmailProps {
  readonly wishlistTitle: string
  readonly wishlistUrl: string
  readonly nbItems: number
  readonly userName: string
}

export default function NewItemsReminderEmail({
  wishlistTitle,
  wishlistUrl,
  nbItems,
  userName,
}: NewItemsReminderEmailProps) {
  const itemsLabel = nbItems === 1 ? 'nouveau souhait ajouté' : 'nouveaux souhaits ajoutés'

  return (
    <EmailLayout preview={`${userName} a ajouté de nouveaux articles à sa liste`}>
      <ContentSection>
        <Heading>Nouveautés sur une liste ! 🎁</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{userName}</b> a ajouté de nouveaux articles à sa liste de souhaits depuis hier.
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.reminder.background} style={{ padding: '25px 30px' }}>
        <Text
          style={{
            ...styles.calloutTitle(styles.palette.reminder.text),
            fontSize: '20px',
            lineHeight: '26px',
            margin: '0 0 10px 0',
          }}
        >
          📝 {wishlistTitle}
        </Text>
        <Text
          style={{
            ...styles.calloutTitle(styles.palette.reminder.text),
            fontSize: '32px',
            lineHeight: '38px',
            margin: 0,
          }}
        >
          {nbItems}
          <span style={{ fontSize: '18px', display: 'block', marginTop: '5px' }}>{itemsLabel}</span>
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Pourquoi est-ce important ?</Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>•</span> Découvrez les nouvelles idées de cadeaux de <b>{userName}</b>
        </Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>•</span> Réservez rapidement avant que d'autres ne le fassent
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <span style={styles.accent}>•</span> Soyez sûr(e) de faire plaisir avec le bon cadeau
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 10px 0' }}>
          💡 Astuce :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          Les articles les plus populaires peuvent être réservés rapidement ! Consultez la liste dès maintenant pour
          avoir le plus grand choix de cadeaux disponibles.
        </Text>
      </Section>

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Cliquez ci-dessous pour découvrir les nouveaux articles ajoutés :
        </Paragraph>
        <PrimaryButton href={wishlistUrl}>Découvrir les nouveautés</PrimaryButton>
        <ButtonFallback href={wishlistUrl} />
      </Section>
    </EmailLayout>
  )
}

NewItemsReminderEmail.PreviewProps = {
  wishlistTitle: 'Ma liste de Noël',
  wishlistUrl: 'https://wishlistapp.fr/wishlists/preview',
  nbItems: 3,
  userName: 'Marie',
} satisfies NewItemsReminderEmailProps
