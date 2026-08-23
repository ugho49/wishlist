import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, Eyebrow, Heading, Paragraph, SectionTitle } from '../components/ui';

export interface EmailChangedConfirmationEmailProps {
  readonly newEmail: string;
}

export default function EmailChangedConfirmationEmail({ newEmail }: EmailChangedConfirmationEmailProps) {
  return (
    <EmailLayout preview="L'adresse email de votre compte a été modifiée">
      <ContentSection>
        <Eyebrow>Compte</Eyebrow>
        <Heading>Votre email a été modifié</Heading>
        <Paragraph>
          Nous vous confirmons que l'adresse email de votre compte Wishlist a été modifiée avec succès.
        </Paragraph>
        <Paragraph>
          Nouvelle adresse email : <strong>{newEmail}</strong>
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          À partir de maintenant, utilisez cette nouvelle adresse pour vous connecter à votre compte.
        </Paragraph>
      </ContentSection>

      <Callout title="Changement effectué" variant="success">
        Cette adresse email n'est plus associée à votre compte Wishlist. Un email de confirmation a été envoyé à votre
        nouvelle adresse.
      </Callout>

      <ContentSection compact style={{ paddingBottom: '36px' }}>
        <SectionTitle>Vous n'avez pas effectué ce changement ?</SectionTitle>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: 0 }}>
          Si vous n'êtes pas à l'origine de ce changement, votre compte a été compromis. Contactez-nous immédiatement
          pour récupérer l'accès à votre compte.
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: '10px 0 0 0' }}>
          Note : Cette ancienne adresse email ne recevra plus les notifications de votre compte Wishlist.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  );
}

EmailChangedConfirmationEmail.PreviewProps = {
  newEmail: 'nouvelle.adresse@example.com',
} satisfies EmailChangedConfirmationEmailProps;
