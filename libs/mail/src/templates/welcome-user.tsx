import { EmailLayout } from '../components/layout';
import {
  Callout,
  ContentSection,
  CtaBlock,
  Eyebrow,
  FeatureItem,
  Heading,
  Paragraph,
  SectionTitle,
  Step,
} from '../components/ui';

export interface WelcomeUserEmailProps {
  readonly mainUrl: string;
}

export default function WelcomeUserEmail({ mainUrl }: WelcomeUserEmailProps) {
  return (
    <EmailLayout preview="Bienvenue sur Wishlist !">
      <ContentSection>
        <Eyebrow>Bienvenue</Eyebrow>
        <Heading>Bienvenue sur Wishlist</Heading>
        <Paragraph style={{ textAlign: 'center' }}>
          Nous sommes ravis de vous accueillir dans notre communauté !
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de Wishlist
          pour organiser vos événements et partager vos souhaits avec vos proches.
        </Paragraph>
      </ContentSection>

      <ContentSection compact>
        <SectionTitle>Que pouvez-vous faire avec Wishlist ?</SectionTitle>
        <FeatureItem>
          <b>Créer des événements</b> : Anniversaires, Noël, mariages, etc.
        </FeatureItem>
        <FeatureItem>
          <b>Partager vos listes de souhaits</b> : Vos proches sauront quoi vous offrir
        </FeatureItem>
        <FeatureItem>
          <b>Organiser un Secret Santa</b> : Tirage au sort automatique avec budget
        </FeatureItem>
        <FeatureItem>
          <b>Inviter vos amis</b> : Partagez facilement vos événements
        </FeatureItem>
      </ContentSection>

      <Callout title="Pour bien démarrer" variant="tip">
        <Step n={1}>Créez votre premier événement</Step>
        <Step n={2}>Ajoutez vos souhaits à votre liste</Step>
        <Step n={3}>Invitez vos proches à rejoindre l'événement</Step>
      </Callout>

      <CtaBlock href={mainUrl}>Découvrir Wishlist</CtaBlock>
    </EmailLayout>
  );
}

WelcomeUserEmail.PreviewProps = {
  mainUrl: 'https://wishlistapp.fr',
} satisfies WelcomeUserEmailProps;
