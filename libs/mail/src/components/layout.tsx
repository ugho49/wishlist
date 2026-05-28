import type { ReactNode } from 'react'

import { Body, Container, Head, Html, Img, Preview, Section, Text } from '@react-email/components'

import * as styles from '../styles'

interface EmailLayoutProps {
  /** Short text shown in the inbox preview line (after the subject). */
  readonly preview: string
  readonly children: ReactNode
}

/**
 * Outer shell shared by every Wishlist email: html/head, inbox preview,
 * logo header and the legal footer. Templates only provide their content
 * sections as `children`.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img alt="Wishlist" src="https://wishlistapp.fr/icon.png" style={styles.logo} width="80" />
            <Img alt="Wishlist" src="https://wishlistapp.fr/logo_text.png" style={styles.logo} width="160" />
          </Section>

          {children}

          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</Text>
            <Text style={styles.footerText}>© Wishlist App - Partagez vos souhaits avec simplicité</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
