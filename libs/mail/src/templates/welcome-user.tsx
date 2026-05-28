import { Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/layout'
import { ButtonFallback, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui'
import * as styles from '../styles'

export interface WelcomeUserEmailProps {
  readonly mainUrl: string
}

export default function WelcomeUserEmail({ mainUrl }: WelcomeUserEmailProps) {
  return (
    <EmailLayout preview="Bienvenue sur Wishlist !">
      <ContentSection style={{ padding: '40px 30px 20px 30px' }}>
        <Heading style={{ fontSize: '28px', lineHeight: '34px' }}>Bienvenue sur Wishlist ! 🎉</Heading>
        <Paragraph style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
          Nous sommes ravis de vous accueillir dans notre communauté !
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de Wishlist
          pour organiser vos événements et partager vos souhaits avec vos proches.
        </Paragraph>
      </ContentSection>

      <ContentSection style={{ padding: '20px 30px' }}>
        <Text style={{ ...styles.sectionTitle, fontSize: '20px', lineHeight: '26px' }}>
          Que pouvez-vous faire avec Wishlist ?
        </Text>
        <Text style={{ ...styles.listItem, paddingLeft: '10px' }}>
          <span style={styles.accent}>✓</span> <b>Créer des événements</b> : Anniversaires, Noël, mariages, etc.
        </Text>
        <Text style={{ ...styles.listItem, paddingLeft: '10px' }}>
          <span style={styles.accent}>✓</span> <b>Partager vos listes de souhaits</b> : Vos proches sauront quoi vous
          offrir
        </Text>
        <Text style={{ ...styles.listItem, paddingLeft: '10px' }}>
          <span style={styles.accent}>✓</span> <b>Organiser un Secret Santa</b> : Tirage au sort automatique avec budget
        </Text>
        <Text style={{ ...styles.listItem, paddingLeft: '10px', margin: 0 }}>
          <span style={styles.accent}>✓</span> <b>Inviter vos amis</b> : Partagez facilement vos événements
        </Text>
      </ContentSection>

      <Section style={{ ...styles.callout(styles.palette.neutral.background), padding: '25px 30px' }}>
        <Text style={{ ...styles.sectionTitle }}>Pour bien démarrer :</Text>
        <Text style={styles.listItem}>
          <b>1.</b> Créez votre premier événement
        </Text>
        <Text style={styles.listItem}>
          <b>2.</b> Ajoutez vos souhaits à votre liste
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <b>3.</b> Invitez vos proches à rejoindre l'événement
        </Text>
      </Section>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={mainUrl}>Découvrir Wishlist</PrimaryButton>
        <ButtonFallback href={mainUrl} />
      </Section>
    </EmailLayout>
  )
}

WelcomeUserEmail.PreviewProps = {
  mainUrl: 'https://wishlistapp.fr',
} satisfies WelcomeUserEmailProps
