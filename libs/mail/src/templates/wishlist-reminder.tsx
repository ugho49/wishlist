import { Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui';
import * as styles from '../styles';

export interface WishlistReminderEmailProps {
  readonly eventTitle: string;
  readonly remindedBy: string;
  /** Days until the event: 0 on the day itself. */
  readonly daysLeft: number;
  /** The event page when the attendee has an account, the sign-up page otherwise. */
  readonly url: string;
  readonly hasAccount: boolean;
}

function countdownLabel(daysLeft: number): string {
  if (daysLeft <= 0) return "C'est aujourd'hui !";
  if (daysLeft === 1) return "C'est demain !";
  return `Plus que ${daysLeft} jours avant le jour J`;
}

export default function WishlistReminderEmail({
  eventTitle,
  remindedBy,
  daysLeft,
  url,
  hasAccount,
}: WishlistReminderEmailProps) {
  return (
    <EmailLayout preview={`${remindedBy} attend vos idées de cadeaux pour ${eventTitle}`} genie="wishlist">
      <ContentSection>
        <Heading>Votre liste se fait attendre ! 🎁</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{remindedBy}</b> vous rappelle que vos proches attendent vos idées de cadeaux pour l'événement :
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.reminder.background}>
        <Text
          style={{
            ...styles.calloutTitle(styles.palette.reminder.text),
            fontSize: '22px',
            lineHeight: '28px',
            margin: '0 0 8px 0',
          }}
        >
          📅 {eventTitle}
        </Text>
        <Text style={{ ...styles.calloutText(styles.palette.reminder.text), margin: 0 }}>
          ⏳ {countdownLabel(daysLeft)}
        </Text>
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        {hasAccount ? (
          <Paragraph style={{ margin: 0 }}>
            Ajoutez quelques souhaits à votre liste pour que vos proches puissent vous faire plaisir. Pas besoin d'en
            faire des tonnes : quelques idées suffisent pour bien démarrer !
          </Paragraph>
        ) : (
          <Paragraph style={{ margin: 0 }}>
            Vous n'avez pas encore créé votre compte Wishlist. C'est gratuit et rapide : inscrivez-vous avec cette
            adresse email pour rejoindre l'événement et partager votre liste de souhaits.
          </Paragraph>
        )}
      </ContentSection>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={url}>{hasAccount ? 'Remplir ma liste' : 'Créer mon compte'}</PrimaryButton>
        <ButtonFallback href={url} />
      </Section>
    </EmailLayout>
  );
}

WishlistReminderEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  remindedBy: 'Marie Dupont',
  daysLeft: 12,
  url: 'https://wishlistapp.fr/events/preview',
  hasAccount: true,
} satisfies WishlistReminderEmailProps;
