import type { NewItemsReminderContext } from '../mail.type'

import { Button, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from './email-layout'
import * as s from './styles'

export function NewItemsReminderEmail({ wishlistTitle, wishlistUrl, nbItems, userName }: NewItemsReminderContext) {
  return (
    <EmailLayout>
      <Section style={s.contentSection}>
        <Text style={s.heading}>Nouveautés sur une liste !</Text>
        <Text style={s.paragraph}>
          <strong>{userName}</strong> a ajouté de nouveaux articles à sa liste de souhaits depuis hier.
        </Text>
      </Section>

      <Section style={s.highlightSection(s.colors.bgHighlight)}>
        <Text
          style={{
            color: s.colors.textYellow,
            fontSize: '20px',
            lineHeight: '26px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '0 0 10px 0',
            margin: 0,
          }}
        >
          {wishlistTitle}
        </Text>
        <Text
          style={{
            color: s.colors.textYellow,
            fontSize: '32px',
            lineHeight: '38px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: 0,
          }}
        >
          {nbItems}
        </Text>
        <Text
          style={{
            color: s.colors.textYellow,
            fontSize: '18px',
            textAlign: 'center',
            marginTop: '5px',
          }}
        >
          {nbItems === 1 ? 'nouveau souhait ajouté' : 'nouveaux souhaits ajoutés'}
        </Text>
      </Section>

      <Section style={{ backgroundColor: s.colors.white, padding: '25px 30px 20px 30px' }}>
        <Text style={s.subHeading}>Pourquoi est-ce important ?</Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>•</strong> Découvrez les nouvelles idées de cadeaux de{' '}
          <strong>{userName}</strong>
        </Text>
        <Text style={s.listItem}>
          <strong style={{ color: s.colors.primary }}>•</strong> Réservez rapidement avant que d'autres ne le fassent
        </Text>
        <Text style={{ ...s.listItem, paddingBottom: 0 }}>
          <strong style={{ color: s.colors.primary }}>•</strong> Soyez sûr(e) de faire plaisir avec le bon cadeau
        </Text>
      </Section>

      <Section style={s.tipSection}>
        <Text style={s.tipHeading}>Astuce :</Text>
        <Text style={s.tipText}>
          Les articles les plus populaires peuvent être réservés rapidement ! Consultez la liste dès maintenant pour
          avoir le plus grand choix de cadeaux disponibles.
        </Text>
      </Section>

      <Section style={s.ctaSection}>
        <Text style={{ ...s.paragraph, textAlign: 'center', paddingBottom: '20px' }}>
          Cliquez ci-dessous pour découvrir les nouveaux articles ajoutés :
        </Text>
        <Button href={wishlistUrl} style={s.button}>
          Découvrir les nouveautés
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
