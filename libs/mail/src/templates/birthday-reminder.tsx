import { Link, Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui';
import * as styles from '../styles';

export interface BirthdayReminderEmailProps {
  readonly firstName: string;
  readonly createEventUrl: string;
  readonly createWishlistUrl: string;
}

export default function BirthdayReminderEmail({
  firstName,
  createEventUrl,
  createWishlistUrl,
}: BirthdayReminderEmailProps) {
  return (
    <EmailLayout preview="Votre anniversaire est dans 30 jours">
      <ContentSection>
        <Heading>Votre anniversaire approche ! 🎂</Heading>
        <Paragraph style={{ margin: 0 }}>
          Bonjour <b>{firstName}</b>, dans 30 jours c'est votre anniversaire. C'est le bon moment pour préparer votre
          événement et votre liste, afin que vos proches sachent quoi vous offrir.
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.reminder.background}>
        <Text style={{ ...styles.calloutText(styles.palette.reminder.text), fontSize: '16px', lineHeight: '24px' }}>
          Créez l'événement, puis ajoutez les souhaits que vous aimeriez recevoir.
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Pour bien préparer la fête :</Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>1.</span> <b>Créez votre événement</b> et invitez les personnes concernées
        </Text>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          <span style={styles.accent}>2.</span> <b>Créez votre liste</b> et ajoutez vos idées de cadeaux
        </Text>
      </ContentSection>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={createEventUrl}>Créer mon événement</PrimaryButton>
        <Text style={{ ...styles.paragraph, textAlign: 'center', margin: '20px 0 0 0' }}>
          Vous avez déjà un événement ?{' '}
          <Link href={createWishlistUrl} style={{ color: styles.colors.primary }}>
            Créez votre liste de souhaits
          </Link>
        </Text>
        <ButtonFallback href={createEventUrl} />
      </Section>
    </EmailLayout>
  );
}

BirthdayReminderEmail.PreviewProps = {
  firstName: 'Marie',
  createEventUrl: 'https://wishlistapp.fr/events/new',
  createWishlistUrl: 'https://wishlistapp.fr/wishlists/new',
} satisfies BirthdayReminderEmailProps;
