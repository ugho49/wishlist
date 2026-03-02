import type { AddedToEventNewUserContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function AddedToEventNewUserEmail({ eventTitle, registerUrl, invitedBy }: AddedToEventNewUserContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Vous êtes invité(e) !</Text>
        <Text style={s.paragraph}>
          <strong>{invitedBy}</strong> vous a ajouté(e) en tant que participant(e) à un événement sur Wishlist :
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgBlue)}>
        <Text style={s.highlightText(s.colors.primary)}>{eventTitle}</Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Qu'est-ce que Wishlist ?</Text>
        <Text style={{ ...s.paragraph, fontSize: '15px' }}>
          Wishlist est une plateforme gratuite qui vous permet de partager vos souhaits avec vos proches et de découvrir
          les leurs. Plus besoin de se demander quoi offrir !
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Créez vos listes de souhaits</strong> pour
          chaque événement
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Consultez les listes</strong> de vos amis et
          famille
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Réservez des cadeaux</strong> en toute
          discrétion
        </Text>
        <Text style={{ ...s.listItem, paddingBottom: 0 }}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Organisez des Secret Santa</strong> facilement
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Pourquoi rejoindre ?</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          • <strong>Gratuit et sans publicité</strong>
        </Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          • <strong>Simple et rapide</strong> à utiliser
        </Text>
        <Text style={s.tipText}>
          • <strong>Vos proches sauront</strong> exactement quoi vous offrir
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Text style={{ ...s.paragraph, textAlign: 'center', paddingBottom: '20px' }}>
          Créez votre compte gratuitement pour participer à cet événement :
        </Text>
        <Button href={registerUrl} style={s.button}>
          Créer mon compte gratuitement
        </Button>
        <Text style={s.fallbackLink}>
          Si le bouton ne fonctionne pas, copiez ce lien :{' '}
          <Link href={registerUrl} style={s.link}>
            {registerUrl}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  )
}
