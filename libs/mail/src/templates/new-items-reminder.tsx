import { Link, Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, Heading, Paragraph } from '../components/ui';
import * as styles from '../styles';

export interface NewItemsReminderEmailProps {
  readonly updates: ReadonlyArray<{
    readonly ownerName: string;
    readonly wishlistTitle: string;
    readonly wishlistUrl: string;
    readonly nbItems: number;
    readonly eventTitles: readonly string[];
  }>;
}

function itemsLabel(nbItems: number): string {
  return nbItems === 1 ? '1 nouveau souhait' : `${nbItems} nouveaux souhaits`;
}

function eventsLabel(eventTitles: readonly string[]): string {
  const label = eventTitles.length > 1 ? 'Événements' : 'Événement';
  return `${label} : ${eventTitles.join(', ')}`;
}

function digestTitle(updates: NewItemsReminderEmailProps['updates']): string {
  const ownerNames = [...new Set(updates.map(update => update.ownerName))];
  if (ownerNames.length === 1) {
    return `${ownerNames[0]} a ajouté des souhaits`;
  }

  return 'Nouveautés sur les listes';
}

export default function NewItemsReminderEmail({ updates }: NewItemsReminderEmailProps) {
  const title = digestTitle(updates);

  return (
    <EmailLayout preview={title}>
      <ContentSection>
        <Heading>{title}</Heading>
        <Paragraph style={{ margin: 0 }}>
          Depuis hier, des participants ont ajouté des souhaits à leurs listes :
        </Paragraph>
      </ContentSection>

      <Callout background={styles.palette.reminder.background} style={{ padding: '20px 30px' }}>
        {updates.map((update, index) => (
          <Text
            key={update.wishlistUrl}
            style={{
              ...styles.calloutText(styles.palette.reminder.text),
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'left',
              margin: index === updates.length - 1 ? 0 : '0 0 16px 0',
            }}
          >
            <b>{update.ownerName}</b> a ajouté <b>{itemsLabel(update.nbItems)}</b> sur{' '}
            <Link href={update.wishlistUrl} style={{ color: styles.palette.reminder.text }}>
              {update.wishlistTitle}
            </Link>
            <br />
            <span style={{ fontSize: '14px', lineHeight: '20px' }}>{eventsLabel(update.eventTitles)}</span>
          </Text>
        ))}
      </Callout>

      <ContentSection style={{ padding: '25px 30px 20px 30px' }}>
        <Text style={styles.sectionTitle}>Pourquoi est-ce important ?</Text>
        <Text style={styles.listItem}>
          <span style={styles.accent}>•</span> Découvrez les nouvelles idées de cadeaux des participants
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
          Les articles les plus populaires peuvent être réservés rapidement ! Consultez les listes dès maintenant pour
          avoir le plus grand choix de cadeaux disponibles.
        </Text>
      </Section>
    </EmailLayout>
  );
}

NewItemsReminderEmail.PreviewProps = {
  updates: [
    {
      ownerName: 'Marie',
      wishlistTitle: 'Ma liste de Noël',
      wishlistUrl: 'https://wishlistapp.fr/wishlists/marie',
      nbItems: 2,
      eventTitles: ['Noël en famille', 'Anniversaire de Paul'],
    },
    {
      ownerName: 'Paul',
      wishlistTitle: 'Mes envies',
      wishlistUrl: 'https://wishlistapp.fr/wishlists/paul',
      nbItems: 1,
      eventTitles: ['Noël en famille'],
    },
  ],
} satisfies NewItemsReminderEmailProps;
