import { EmailLayout } from '../components/layout';
import {
  Callout,
  ContentSection,
  CtaBlock,
  Eyebrow,
  FeatureItem,
  Heading,
  HighlightCard,
  Paragraph,
  SectionTitle,
} from '../components/ui';

export interface NewItemsReminderEmailProps {
  readonly wishlistTitle: string;
  readonly wishlistUrl: string;
  readonly nbItems: number;
  readonly userName: string;
}

export default function NewItemsReminderEmail({
  wishlistTitle,
  wishlistUrl,
  nbItems,
  userName,
}: NewItemsReminderEmailProps) {
  const itemsLabel = nbItems === 1 ? 'nouveau souhait ajouté' : 'nouveaux souhaits ajoutés';

  return (
    <EmailLayout preview={`${userName} a ajouté de nouveaux articles à sa liste`}>
      <ContentSection>
        <Eyebrow>Nouveautés</Eyebrow>
        <Heading>De nouveaux souhaits</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{userName}</b> a ajouté de nouveaux articles à sa liste de souhaits depuis hier.
        </Paragraph>
      </ContentSection>

      <HighlightCard count={nbItems} detail={itemsLabel}>
        {wishlistTitle}
      </HighlightCard>

      <ContentSection compact>
        <SectionTitle>Pourquoi est-ce important ?</SectionTitle>
        <FeatureItem>
          Découvrez les nouvelles idées de cadeaux de <b>{userName}</b>
        </FeatureItem>
        <FeatureItem>Réservez rapidement avant que d'autres ne le fassent</FeatureItem>
        <FeatureItem>Soyez sûr(e) de faire plaisir avec le bon cadeau</FeatureItem>
      </ContentSection>

      <Callout title="Astuce" variant="tip">
        Les articles les plus populaires peuvent être réservés rapidement ! Consultez la liste dès maintenant pour avoir
        le plus grand choix de cadeaux disponibles.
      </Callout>

      <CtaBlock href={wishlistUrl}>Découvrir les nouveautés</CtaBlock>
    </EmailLayout>
  );
}

NewItemsReminderEmail.PreviewProps = {
  wishlistTitle: 'Ma liste de Noël',
  wishlistUrl: 'https://wishlistapp.fr/wishlists/preview',
  nbItems: 3,
  userName: 'Marie',
} satisfies NewItemsReminderEmailProps;
