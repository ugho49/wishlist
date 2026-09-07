import { Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { ButtonFallback, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui';
import * as styles from '../styles';

export interface EventReminderEmailProps {
  readonly firstName: string;
  readonly eventTitle: string;
  readonly eventUrl: string;
}

export default function EventReminderEmail(props: EventReminderEmailProps) {
  return (
    <EmailLayout preview={`${props.eventTitle} est dans 7 jours`}>
      <ContentSection>
        <Heading>{props.eventTitle} est dans 7 jours</Heading>
        <Paragraph style={{ margin: 0 }}>
          {props.firstName}, l’événement approche. Pensez à jeter un œil aux listes et à réserver un cadeau.
        </Paragraph>
      </ContentSection>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={props.eventUrl}>Voir l’événement</PrimaryButton>
        <ButtonFallback href={props.eventUrl} />
      </Section>

      <ContentSection>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          Ce message est un pense-bête automatique, envoyé à tous les participants.
        </Text>
      </ContentSection>
    </EmailLayout>
  );
}

EventReminderEmail.PreviewProps = {
  firstName: 'Marie',
  eventTitle: 'Noël',
  eventUrl: 'https://wishlistapp.fr/events/1',
} satisfies EventReminderEmailProps;
