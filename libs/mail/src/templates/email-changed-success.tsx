import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, Eyebrow, FeatureItem, Heading, Paragraph, SectionTitle } from '../components/ui';

export interface EmailChangedSuccessEmailProps {
  readonly email: string;
}

export default function EmailChangedSuccessEmail({ email }: EmailChangedSuccessEmailProps) {
  return (
    <EmailLayout preview="Bienvenue sur votre nouvelle adresse email Wishlist">
      <ContentSection>
        <Eyebrow>Compte</Eyebrow>
        <Heading>Votre nouvelle adresse est active</Heading>
        <Paragraph>Félicitations ! Votre adresse email a été mise à jour avec succès.</Paragraph>
        <Paragraph>
          Votre nouvelle adresse email : <strong>{email}</strong>
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Utilisez désormais cette adresse pour vous connecter à votre compte Wishlist et recevoir toutes les
          notifications.
        </Paragraph>
      </ContentSection>

      <Callout title="Changement confirmé" variant="success">
        Toutes les futures notifications et communications de Wishlist seront envoyées à cette nouvelle adresse email.
      </Callout>

      <ContentSection compact style={{ paddingBottom: '36px' }}>
        <SectionTitle>À retenir</SectionTitle>
        <FeatureItem>Votre ancien email n'est plus associé à votre compte</FeatureItem>
        <FeatureItem>Utilisez votre nouvelle adresse pour vous connecter</FeatureItem>
        <FeatureItem>Vos listes de souhaits et événements restent inchangés</FeatureItem>
        <FeatureItem>Vos préférences de notification sont conservées</FeatureItem>
      </ContentSection>
    </EmailLayout>
  );
}

EmailChangedSuccessEmail.PreviewProps = {
  email: 'nouvelle.adresse@example.com',
} satisfies EmailChangedSuccessEmailProps;
