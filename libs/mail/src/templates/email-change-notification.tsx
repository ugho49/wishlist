import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, Eyebrow, FeatureItem, Heading, Paragraph, SectionTitle } from '../components/ui';

export interface EmailChangeNotificationEmailProps {
  readonly newEmail: string;
}

export default function EmailChangeNotificationEmail({ newEmail }: EmailChangeNotificationEmailProps) {
  return (
    <EmailLayout preview="Une demande de changement d'email a été effectuée">
      <ContentSection>
        <Eyebrow>Sécurité</Eyebrow>
        <Heading>Demande de changement d'email</Heading>
        <Paragraph>Une demande de changement d'adresse email a été effectuée sur votre compte Wishlist.</Paragraph>
        <Paragraph>
          La nouvelle adresse email demandée est : <strong>{newEmail}</strong>
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Un email de confirmation a été envoyé à cette nouvelle adresse. Le changement ne sera effectif qu'après
          validation via le lien de confirmation.
        </Paragraph>
      </ContentSection>

      <Callout title="Information" variant="info">
        Votre adresse email actuelle reste active jusqu'à la confirmation du changement. Vous pouvez continuer à
        utiliser votre compte normalement.
      </Callout>

      <ContentSection compact style={{ paddingBottom: '36px' }}>
        <SectionTitle>Vous n'avez pas demandé ce changement ?</SectionTitle>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px' }}>
          Si vous n'êtes pas à l'origine de cette demande, votre compte pourrait être compromis. Nous vous recommandons
          de :
        </Paragraph>
        <FeatureItem>Changer immédiatement votre mot de passe</FeatureItem>
        <FeatureItem>Vérifier l'activité récente de votre compte</FeatureItem>
        <FeatureItem>Ignorer l'email de confirmation (le changement ne sera pas effectué)</FeatureItem>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: '10px 0 0 0' }}>
          Si vous ignorez l'email de confirmation, votre adresse email actuelle ne sera jamais modifiée.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  );
}

EmailChangeNotificationEmail.PreviewProps = {
  newEmail: 'nouvelle.adresse@example.com',
} satisfies EmailChangeNotificationEmailProps;
