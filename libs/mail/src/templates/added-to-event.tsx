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

export interface AddedToEventEmailProps {
  readonly eventTitle: string;
  readonly eventUrl: string;
  readonly invitedBy: string;
}

export default function AddedToEventEmail({ eventTitle, eventUrl, invitedBy }: AddedToEventEmailProps) {
  return (
    <EmailLayout preview={`${invitedBy} vous a invité(e) à un événement sur Wishlist`}>
      <ContentSection>
        <Eyebrow>Invitation</Eyebrow>
        <Heading>Vous êtes invité(e) à un événement</Heading>
        <Paragraph style={{ margin: 0 }}>
          Bonne nouvelle ! <b>{invitedBy}</b> vous a ajouté(e) en tant que participant(e) à l'événement :
        </Paragraph>
      </ContentSection>

      <HighlightCard>{eventTitle}</HighlightCard>

      <ContentSection compact>
        <SectionTitle>Ce que vous pouvez faire maintenant</SectionTitle>
        <FeatureItem>
          <b>Créer votre liste de souhaits</b> pour cet événement
        </FeatureItem>
        <FeatureItem>
          <b>Consulter les listes</b> des autres participants
        </FeatureItem>
        <FeatureItem>
          <b>Réserver des cadeaux</b> pour vos proches
        </FeatureItem>
        <FeatureItem>
          <b>Participer au Secret Santa</b> si organisé
        </FeatureItem>
      </ContentSection>

      <Callout title="Conseil" variant="tip">
        Plus vous ajoutez d'éléments à votre liste, plus il sera facile pour vos proches de vous faire plaisir !
        N'hésitez pas à varier les prix et à être précis dans vos descriptions.
      </Callout>

      <CtaBlock href={eventUrl}>Accéder à l'événement</CtaBlock>
    </EmailLayout>
  );
}

AddedToEventEmail.PreviewProps = {
  eventTitle: 'Noël en famille 2026',
  eventUrl: 'https://wishlistapp.fr/events/preview',
  invitedBy: 'Marie Dupont',
} satisfies AddedToEventEmailProps;
