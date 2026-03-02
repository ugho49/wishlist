import type { WelcomeUserContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function WelcomeUserEmail({ mainUrl }: WelcomeUserContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Bienvenue sur Wishlist !</Text>
        <Text style={{ ...s.paragraph, textAlign: 'center' }}>
          Nous sommes ravis de vous accueillir dans notre communauté !
        </Text>
        <Text style={s.paragraph}>
          Votre compte a été créé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de Wishlist
          pour organiser vos événements et partager vos souhaits avec vos proches.
        </Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '20px 30px' }}>
        <Text style={s.subHeading}>Que pouvez-vous faire avec Wishlist ?</Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Créer des événements</strong> : Anniversaires,
          Noël, mariages, etc.
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Partager vos listes de souhaits</strong> : Vos
          proches sauront quoi vous offrir
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Organiser un Secret Santa</strong> : Tirage au
          sort automatique avec budget
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Inviter vos amis</strong> : Partagez facilement
          vos événements
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={{ ...s.subHeading, fontSize: '18px' }}>Pour bien démarrer :</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          <strong>1.</strong> Créez votre premier événement
        </Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          <strong>2.</strong> Ajoutez vos souhaits à votre liste
        </Text>
        <Text style={s.tipText}>
          <strong>3.</strong> Invitez vos proches à rejoindre l'événement
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Button href={mainUrl} style={s.button}>
          Découvrir Wishlist
        </Button>
        <Text style={s.fallbackLink}>
          Si le bouton ne fonctionne pas, copiez ce lien :{' '}
          <Link href={mainUrl} style={s.link}>
            {mainUrl}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  )
}
