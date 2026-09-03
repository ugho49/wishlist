import { Link, Section, Text } from 'react-email';

import { EmailLayout } from '../components/layout';
import { ButtonFallback, Callout, ContentSection, Heading, Paragraph, PrimaryButton } from '../components/ui';
import * as styles from '../styles';

export interface NewItemsReminderEmailProps {
  readonly eventTitle: string;
  readonly eventUrl: string;
  readonly updates: ReadonlyArray<{
    readonly ownerName: string;
    readonly wishlistTitle: string;
    readonly wishlistUrl: string;
    readonly nbItems: number;
  }>;
}

function itemsLabel(nbItems: number): string {
  return nbItems === 1 ? '1 nouveau souhait' : `${nbItems} nouveaux souhaits`;
}

export default function NewItemsReminderEmail({ eventTitle, eventUrl, updates }: NewItemsReminderEmailProps) {
  const previewNames = updates
    .map(update => update.ownerName)
    .slice(0, 3)
    .join(', ');

  return (
    <EmailLayout preview={`Nouveautés sur ${eventTitle} : ${previewNames}`}>
      <ContentSection>
        <Heading>Nouveautés sur {eventTitle} ! 🎁</Heading>
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
              margin: index === updates.length - 1 ? 0 : '0 0 12px 0',
            }}
          >
            <b>{update.ownerName}</b> a ajouté <b>{itemsLabel(update.nbItems)}</b> sur{' '}
            <Link href={update.wishlistUrl} style={{ color: styles.palette.reminder.text }}>
              {update.wishlistTitle}
            </Link>
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

      <Section style={styles.buttonSection}>
        <Paragraph style={{ textAlign: 'center', fontSize: '15px', lineHeight: '22px', margin: '0 0 20px 0' }}>
          Cliquez ci-dessous pour découvrir les nouveautés :
        </Paragraph>
        <PrimaryButton href={eventUrl}>Voir l'événement</PrimaryButton>
        <ButtonFallback href={eventUrl} />
      </Section>
    </EmailLayout>
  );
}

NewItemsReminderEmail.PreviewProps = {
  eventTitle: 'Noël en famille',
  eventUrl: 'https://wishlistapp.fr/events/preview',
  updates: [
    {
      ownerName: 'Marie',
      wishlistTitle: 'Ma liste de Noël',
      wishlistUrl: 'https://wishlistapp.fr/wishlists/marie',
      nbItems: 2,
    },
    {
      ownerName: 'Paul',
      wishlistTitle: 'Mes envies',
      wishlistUrl: 'https://wishlistapp.fr/wishlists/paul',
      nbItems: 1,
    },
  ],
} satisfies NewItemsReminderEmailProps;
