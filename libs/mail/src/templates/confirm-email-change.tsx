import { EmailLayout } from '../components/layout';
import { Callout, ContentSection, CtaBlock, Eyebrow, Heading, Paragraph, SectionTitle } from '../components/ui';

export interface ConfirmEmailChangeEmailProps {
  readonly url: string;
  readonly newEmail: string;
}

export default function ConfirmEmailChangeEmail({ url, newEmail }: ConfirmEmailChangeEmailProps) {
  return (
    <EmailLayout preview="Confirmez le changement de votre adresse email">
      <ContentSection>
        <Eyebrow>Compte</Eyebrow>
        <Heading>Confirmez votre nouvelle adresse</Heading>
        <Paragraph>
          Vous avez demandé à changer l'adresse email de votre compte Wishlist pour <strong>{newEmail}</strong>.
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</Paragraph>
      </ContentSection>

      <CtaBlock href={url}>Confirmer le changement d'email</CtaBlock>

      <Callout title="Ce lien expire dans 15 minutes" variant="warning">
        Pour des raisons de sécurité, ce lien de confirmation n'est valide que pendant 15 minutes. Passé ce délai, vous
        devrez faire une nouvelle demande.
      </Callout>

      <ContentSection compact style={{ paddingBottom: '36px' }}>
        <SectionTitle>Vous n'avez pas demandé ce changement ?</SectionTitle>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: 0 }}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre
          adresse email actuelle restera inchangée et votre compte est protégé.
        </Paragraph>
        <Paragraph style={{ fontSize: '14px', lineHeight: '22px', margin: '10px 0 0 0' }}>
          Nous vous recommandons toutefois de vérifier l'activité récente de votre compte si vous recevez régulièrement
          ce type de message.
        </Paragraph>
      </ContentSection>
    </EmailLayout>
  );
}

ConfirmEmailChangeEmail.PreviewProps = {
  url: 'https://wishlistapp.fr/confirm-email?token=preview',
  newEmail: 'nouvelle.adresse@example.com',
} satisfies ConfirmEmailChangeEmailProps;
