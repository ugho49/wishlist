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

export interface AddedToEventNewUserEmailProps {
  readonly eventTitle: string;
  readonly registerUrl: string;
  readonly invitedBy: string;
}

export default function AddedToEventNewUserEmail({
  eventTitle,
  registerUrl,
  invitedBy,
}: AddedToEventNewUserEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous invite à rejoindre Wishlist`}>
      <ContentSection>
        <Eyebrow>Invitation</Eyebrow>
        <Heading>Vous êtes invité(e)</Heading>
        <Paragraph style={{ margin: 0 }}>
          <b>{invitedBy}</b> vous a ajouté(e) en tant que participant(e) à un événement sur Wishlist :
        </Paragraph>
      </ContentSection>

      <HighlightCard>{eventTitle}</HighlightCard>

      <ContentSection compact>
        <SectionTitle>Qu'est-ce que Wishlist ?</SectionTitle>
        <Paragraph style={{ fontSize: '15px', lineHeight: '24px' }}>
          Wishlist est une plateforme gratuite qui vous permet de partager vos souhaits avec vos proches et de découvrir
          les leurs. Plus besoin de se demander quoi offrir !
        </Paragraph>
        <FeatureItem>
          <b>Créez vos listes de souhaits</b> pour chaque événement
        </FeatureItem>
        <FeatureItem>
          <b>Consultez les listes</b> de vos amis et famille
        </FeatureItem>
        <FeatureItem>
          <b>Réservez des cadeaux</b> en toute discrétion
        </FeatureItem>
        <FeatureItem>
          <b>Organisez des Secret Santa</b> facilement
        </FeatureItem>
      </ContentSection>

      <Callout title="Pourquoi rejoindre ?" variant="tip">
        <FeatureItem>
          <b>Gratuit et sans publicité</b>
        </FeatureItem>
        <FeatureItem>
          <b>Simple et rapide</b> à utiliser
        </FeatureItem>
        <FeatureItem>
          <b>Vos proches sauront</b> exactement quoi vous offrir
        </FeatureItem>
      </Callout>

      <CtaBlock href={registerUrl}>Créer mon compte gratuitement</CtaBlock>
    </EmailLayout>
  );
}

AddedToEventNewUserEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  registerUrl: 'https://wishlistapp.fr/register?invitation=preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToEventNewUserEmailProps;
