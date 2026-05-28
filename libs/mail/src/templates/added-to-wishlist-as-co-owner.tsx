import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface AddedToWishlistAsCoOwnerEmailProps {
  readonly wishlistTitle: string
  readonly wishlistUrl: string
  readonly invitedBy: string
}

export default function AddedToWishlistAsCoOwnerEmail({
  wishlistTitle,
  wishlistUrl,
  invitedBy,
}: AddedToWishlistAsCoOwnerEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous a ajouté(e) comme co-gestionnaire d'une liste`}>
      <ContentSection>
        <Heading>Vous êtes co-gestionnaire ! 🤝</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{invitedBy}</b> vous a ajouté(e) en tant que co-gestionnaire de la liste de souhaits :
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.blue.background}>
        <Text
          style={{ ...styles.calloutTitle(styles.palette.blue.text), fontSize: '22px', lineHeight: '28px', margin: 0 }}
        >
          📝 {wishlistTitle}
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Qu'est-ce qu'un co-gestionnaire ?</Text>
        <Paragraph style={{ fontSize: '15px', lineHeight: '22px', margin: 0 }}>
          En tant que co-gestionnaire, vous partagez les mêmes droits que le propriétaire de la liste. Vous pouvez gérer
          cette liste de souhaits ensemble.
        </Paragraph>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background) }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 12px 0' }}>
          🔑 Vos droits en tant que co-gestionnaire :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          <span style={styles.accent}>✓</span> <b>Ajouter des articles</b> à la liste de souhaits
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          <span style={styles.accent}>✓</span> <b>Modifier ou supprimer</b> les articles existants
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          <span style={styles.accent}>✓</span> <b>Gérer les paramètres</b> de la liste
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          <span style={styles.accent}>✓</span> <b>Ajouter d'autres co-gestionnaires</b>
        </Text>
      </Section>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '16px', lineHeight: '22px', margin: '0 0 10px 0' }}>
          💡 Cas d'usage typiques :
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • Liste partagée pour un couple
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: '0 0 8px 0' }}>
          • Liste commune pour des enfants gérée par les parents
        </Text>
        <Text style={{ ...styles.listItem, fontSize: '14px', lineHeight: '21px', margin: 0 }}>
          • Liste collaborative pour un projet commun
        </Text>
      </ContentSection>

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Commencez dès maintenant à gérer cette liste :
        </Paragraph>
        <PrimaryButton href={wishlistUrl}>Gérer la liste</PrimaryButton>
        <ButtonFallback href={wishlistUrl} />
      </Section>
    </EmailLayout>
  )
}

AddedToWishlistAsCoOwnerEmail.PreviewProps = {
  wishlistTitle: 'Ma liste de Noël',
  wishlistUrl: 'https://wishlistapp.fr/wishlists/preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToWishlistAsCoOwnerEmailProps
