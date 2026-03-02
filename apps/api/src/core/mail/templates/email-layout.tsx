import type { ReactNode } from 'react'

import { Body, Container, Head, Html, Img, Section, Text } from '@react-email/components'

const main: React.CSSProperties = {
  backgroundColor: '#F4F4F4',
  fontFamily: 'Arial, sans-serif',
}

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
}

const logoSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const logoIcon: React.CSSProperties = {
  margin: '0 auto',
}

const logoText: React.CSSProperties = {
  margin: '0 auto',
}

const footerSection: React.CSSProperties = {
  padding: '5px 0 10px 0',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  color: '#9d9d9d',
  fontSize: '11px',
  lineHeight: '18px',
  padding: '15px 25px 5px 25px',
  textAlign: 'center' as const,
}

const footerCopyright: React.CSSProperties = {
  color: '#9d9d9d',
  fontSize: '11px',
  lineHeight: '18px',
  padding: '5px 25px 15px 25px',
  textAlign: 'center' as const,
}

type EmailLayoutProps = {
  children: ReactNode
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img src="https://wishlistapp.fr/icon.png" width="80" alt="Wishlist App" style={logoIcon} />
            <Img src="https://wishlistapp.fr/logo_text.png" width="160" alt="Wishlist" style={logoText} />
          </Section>

          {children}

          <Section style={footerSection}>
            <Text style={footerText}>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</Text>
            <Text style={footerCopyright}>© Wishlist App - Partagez vos souhaits avec simplicité</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
