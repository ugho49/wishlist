import { EmailLayout } from '../components/layout';
import {
  Callout,
  ContentSection,
  CtaBlock,
  DetailRow,
  Eyebrow,
  FeatureItem,
  Heading,
  HighlightCard,
  Paragraph,
  SectionTitle,
} from '../components/ui';

export interface SecretSantaDrawEmailProps {
  readonly eventTitle: string;
  readonly eventUrl: string;
  readonly budget: string;
  readonly description: string;
}

export default function SecretSantaDrawEmail({ eventTitle, eventUrl, budget, description }: SecretSantaDrawEmailProps) {
  return (
    <EmailLayout preview="Le tirage Secret Santa a eu lieu — viens découvrir le tien">
      <ContentSection>
        <Eyebrow>Secret Santa</Eyebrow>
        <Heading>Le tirage a eu lieu</Heading>
        <Paragraph style={{ textAlign: 'center', margin: 0 }}>Le tirage au sort a eu lieu pour l'événement :</Paragraph>
      </ContentSection>

      <HighlightCard>{eventTitle}</HighlightCard>

      <Callout title="Ton Secret Santa t'attend" variant="success">
        Rends-toi sur l'événement et gratte la boule de Noël pour découvrir à qui tu dois offrir un cadeau.
      </Callout>

      <ContentSection compact>
        <SectionTitle>Détails du Secret Santa</SectionTitle>
        <DetailRow label="Budget maximum :" value={budget} />
        <DetailRow label="Description :" value={description} />
      </ContentSection>

      <Callout title="Conseils pour votre cadeau" variant="tip">
        <FeatureItem>Consultez la liste de souhaits de cette personne pour trouver l'inspiration</FeatureItem>
        <FeatureItem>Respectez le budget maximum indiqué ci-dessus</FeatureItem>
        <FeatureItem>Gardez le secret jusqu'à l'échange des cadeaux !</FeatureItem>
      </Callout>

      <Callout title="Rappel important" variant="warning">
        Ne révélez à personne qui est votre Secret Santa ! C'est le principe du jeu. Consultez la liste de la personne
        tirée au sort pour vous inspirer.
      </Callout>

      <CtaBlock href={eventUrl}>Découvre ton Secret Santa ici</CtaBlock>
    </EmailLayout>
  );
}

SecretSantaDrawEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
  budget: '30,00 €',
  description: 'Cadeaux faits maison appréciés',
} satisfies SecretSantaDrawEmailProps;
