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

export interface AddedToWishlistAsCoOwnerEmailProps {
  readonly wishlistTitle: string;
  readonly wishlistUrl: string;
  readonly invitedBy: string;
}

export default function AddedToWishlistAsCoOwnerEmail({
  wishlistTitle,
  wishlistUrl,
  invitedBy,
}: AddedToWishlistAsCoOwnerEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous a ajouté(e) comme co-gestionnaire d'une liste`}>
      <ContentSection>
        <Eyebrow>Liste partagée</Eyebrow>
        <Heading>Vous êtes co-gestionnaire</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{invitedBy}</b> vous a ajouté(e) en tant que co-gestionnaire de la liste de souhaits :
        </Paragraph>
      </ContentSection>

      <HighlightCard>{wishlistTitle}</HighlightCard>

      <ContentSection compact>
        <SectionTitle>Qu'est-ce qu'un co-gestionnaire ?</SectionTitle>
        <Paragraph style={{ fontSize: '15px', lineHeight: '24px', margin: 0 }}>
          En tant que co-gestionnaire, vous partagez les mêmes droits que le propriétaire de la liste. Vous pouvez gérer
          cette liste de souhaits ensemble.
        </Paragraph>
      </ContentSection>

      <Callout title="Vos droits" variant="info">
        <FeatureItem>
          <b>Ajouter des articles</b> à la liste de souhaits
        </FeatureItem>
        <FeatureItem>
          <b>Modifier ou supprimer</b> les articles existants
        </FeatureItem>
        <FeatureItem>
          <b>Gérer les paramètres</b> de la liste
        </FeatureItem>
        <FeatureItem>
          <b>Ajouter d'autres co-gestionnaires</b>
        </FeatureItem>
      </Callout>

      <ContentSection compact>
        <SectionTitle>Cas d'usage typiques</SectionTitle>
        <FeatureItem>Liste partagée pour un couple</FeatureItem>
        <FeatureItem>Liste commune pour des enfants gérée par les parents</FeatureItem>
        <FeatureItem>Liste collaborative pour un projet commun</FeatureItem>
      </ContentSection>

      <CtaBlock href={wishlistUrl}>Gérer la liste</CtaBlock>
    </EmailLayout>
  );
}

AddedToWishlistAsCoOwnerEmail.PreviewProps = {
  wishlistTitle: 'Ma liste de Noël',
  wishlistUrl: 'https://wishlistapp.fr/wishlists/preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToWishlistAsCoOwnerEmailProps;
