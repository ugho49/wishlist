import type { AddedToWishlistAsCoOwnerContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function AddedToWishlistAsCoOwnerEmail({
  wishlistTitle,
  wishlistUrl,
  invitedBy,
}: AddedToWishlistAsCoOwnerContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Vous êtes co-gestionnaire !</Text>
        <Text style={s.paragraph}>
          <strong>{invitedBy}</strong> vous a ajouté(e) en tant que co-gestionnaire de la liste de souhaits :
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgBlueLight)}>
        <Text style={s.highlightText(s.colors.textBlueLight)}>{wishlistTitle}</Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Qu'est-ce qu'un co-gestionnaire ?</Text>
        <Text style={{ ...s.paragraph, fontSize: '15px' }}>
          En tant que co-gestionnaire, vous partagez les mêmes droits que le propriétaire de la liste. Vous pouvez gérer
          cette liste de souhaits ensemble.
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Vos droits en tant que co-gestionnaire :</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Ajouter des articles</strong> à la liste de
          souhaits
        </Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Modifier ou supprimer</strong> les articles
          existants
        </Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Gérer les paramètres</strong> de la liste
        </Text>
        <Text style={s.tipText}>
          <strong style={{ color: s.colors.primary }}>✓</strong> <strong>Ajouter d'autres co-gestionnaires</strong>
        </Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.tipHeading}>Cas d'usage typiques :</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>• Liste partagée pour un couple</Text>
        <Text style={{ ...s.tipText, paddingBottom: '8px' }}>
          • Liste commune pour des enfants gérée par les parents
        </Text>
        <Text style={s.tipText}>• Liste collaborative pour un projet commun</Text>
      </Section>

      <Section style={s.ctaSection}>
        <Text style={{ ...s.paragraph, textAlign: 'center', paddingBottom: '20px' }}>
          Commencez dès maintenant à gérer cette liste :
        </Text>
        <Button href={wishlistUrl} style={s.button}>
          Gérer la liste
        </Button>
        <Text style={s.fallbackLink}>
          Si le bouton ne fonctionne pas, copiez ce lien :{' '}
          <Link href={wishlistUrl} style={s.link}>
            {wishlistUrl}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  )
}
