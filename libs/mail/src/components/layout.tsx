import type { ReactNode } from 'react';

import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from 'react-email';

import * as styles from '../styles';

interface EmailLayoutProps {
  /** Short text shown in the inbox preview line (after the subject). */
  readonly preview: string;
  readonly children: ReactNode;
}

/**
 * Outer shell shared by every Wishlist email: cream canvas, horizontal logo,
 * single stationery card with a navy ribbon, and a quiet legal footer.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="fr" style={{ width: '100%' }}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="light" name="color-scheme" />
        <meta content="light" name="supported-color-schemes" />
        <style>{styles.responsiveCss}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.main}>
        <Section className="wl-outer" style={styles.bodyInner}>
          <Container style={styles.container}>
            <Section style={styles.logoSection}>
              <Img alt="" height="36" src="https://wishlistapp.fr/icon.png" style={styles.logoIcon} width="36" />
              <Img alt="Wishlist" src="https://wishlistapp.fr/logo_text.png" style={styles.logoWordmark} width="148" />
            </Section>

            <Section className="wl-card" style={styles.card}>
              <Section style={styles.ribbon}>&nbsp;</Section>
              {children}
            </Section>

            <Section className="wl-pad" style={styles.footerSection}>
              <Text style={styles.footerText}>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</Text>
              <Text style={styles.footerText}>© Wishlist App — Partagez vos souhaits avec simplicité</Text>
              <Text style={styles.footerText}>
                <Link href="https://wishlistapp.fr" style={styles.footerLink}>
                  wishlistapp.fr
                </Link>
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
