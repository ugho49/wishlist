import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, CtaBlock, Eyebrow, Heading, Paragraph, SectionTitle } from '../components/ui';

export interface ResetPasswordEmailProps {
  readonly url: string;
}

export default function ResetPasswordEmail({ url }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Réinitialisation de votre mot de passe Wishlist">
      <ContentSection>
        <Eyebrow>Sécurité</Eyebrow>
        <Heading>Réinitialisation de mot de passe</Heading>
        <Paragraph style={{ margin: 0 }}>
          Vous avez demandé à réinitialiser votre mot de passe pour votre compte Wishlist. Cliquez sur le bouton
          ci-dessous pour créer un nouveau mot de passe.
        </Paragraph>
      </ContentSection>

      <CtaBlock href={url}>Réinitialiser mon mot de passe</CtaBlock>

      <Callout title="Ce lien expire dans 15 minutes" variant="warning">
        Pour des raisons de sécurité, ce lien de réinitialisation n'est valide que pendant 15 minutes. Passé ce délai,
        vous devrez faire une nouvelle demande.
      </Callout>

      <ContentSection compact style={{ paddingBottom: '36px' }}>
        <SectionTitle>Vous n'avez pas demandé cette réinitialisation ?</SectionTitle>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: 0 }}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot
          de passe actuel restera inchangé et votre compte est protégé.
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: '10px 0 0 0' }}>
          Nous vous recommandons toutefois de vérifier l'activité récente de votre compte si vous recevez régulièrement
          ce type de message.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  url: 'https://wishlistapp.fr/reset-password?token=preview',
} satisfies ResetPasswordEmailProps;
