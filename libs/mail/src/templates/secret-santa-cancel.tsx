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

export interface SecretSantaCancelEmailProps {
  readonly eventTitle: string;
  readonly eventUrl: string;
}

export default function SecretSantaCancelEmail({ eventTitle, eventUrl }: SecretSantaCancelEmailProps) {
  return (
    <EmailLayout preview="Le Secret Santa de votre événement a été annulé">
      <ContentSection>
        <Eyebrow>Secret Santa</Eyebrow>
        <Heading>Annulation du Secret Santa</Heading>
        <Paragraph style={{ margin: 0 }}>
          Nous vous informons que l'organisateur de l'événement a décidé d'annuler le Secret Santa pour :
        </Paragraph>
      </ContentSection>

      <HighlightCard>{eventTitle}</HighlightCard>

      <ContentSection compact>
        <SectionTitle>Qu'est-ce que cela signifie ?</SectionTitle>
        <FeatureItem>Le tirage au sort Secret Santa a été annulé</FeatureItem>
        <FeatureItem>Vous n'avez plus besoin d'acheter de cadeau dans le cadre du Secret Santa</FeatureItem>
        <FeatureItem>L'événement reste actif et vous pouvez toujours consulter les listes de souhaits</FeatureItem>
      </ContentSection>

      <Callout title="Bon à savoir" variant="info">
        L'annulation du Secret Santa n'affecte pas l'événement en lui-même. Vous pouvez continuer à gérer vos listes de
        souhaits, consulter celles des autres participants et réserver des cadeaux normalement.
      </Callout>

      <CtaBlock href={eventUrl}>Accéder à l'événement</CtaBlock>
    </EmailLayout>
  );
}

SecretSantaCancelEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
} satisfies SecretSantaCancelEmailProps;
