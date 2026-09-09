import { Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { ButtonFallback, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui';
import * as styles from '../styles';

export type CalendarReminderKind = 'birthday' | 'christmas';

export interface CalendarReminderEmailProps {
  readonly firstName: string;
  readonly kind: CalendarReminderKind;
  readonly daysLeft: 7 | 30;
  readonly actionUrl: string;
}

function copy(props: CalendarReminderEmailProps) {
  const when = props.daysLeft === 7 ? 'dans 7 jours' : 'dans 30 jours';
  if (props.kind === 'christmas') {
    return {
      preview: `Noël est ${when}`,
      heading: `Noël est ${when} 🎄`,
      body: `${props.firstName}, c’est le moment de regarder les listes de vos proches et de réserver un cadeau avant la ruée.`,
      cta: 'Voir les événements',
    };
  }
  return {
    preview: `Votre anniversaire est ${when}`,
    heading: `Votre anniversaire est ${when} 🎂`,
    body: `${props.firstName}, pensez à mettre votre liste à jour pour que vos proches sachent quoi vous offrir.`,
    cta: 'Voir mes listes',
  };
}

export default function CalendarReminderEmail(props: CalendarReminderEmailProps) {
  const text = copy(props);

  return (
    <EmailLayout preview={text.preview}>
      <ContentSection>
        <Heading>{text.heading}</Heading>
        <Paragraph style={{ margin: 0 }}>{text.body}</Paragraph>
      </ContentSection>

      <Section style={styles.buttonSection}>
        <PrimaryButton href={props.actionUrl}>{text.cta}</PrimaryButton>
        <ButtonFallback href={props.actionUrl} />
      </Section>

      <ContentSection>
        <Text style={{ ...styles.listItem, margin: 0 }}>
          Aucun événement n’est créé automatiquement : ce message est juste un pense-bête.
        </Text>
      </ContentSection>
    </EmailLayout>
  );
}

CalendarReminderEmail.PreviewProps = {
  firstName: 'Marie',
  kind: 'birthday',
  daysLeft: 7,
  actionUrl: 'https://wishlistapp.fr/wishlists',
} satisfies CalendarReminderEmailProps;
