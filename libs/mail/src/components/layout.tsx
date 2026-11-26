import type { ReactNode } from 'react';

import { Body, Container, Head, Html, Img, Preview, Section, Text } from 'react-email';

import * as styles from '../styles';

/** Genie poses available as email illustrations (apps/front/public/email/genie-*.png). */
export type EmailGenie = 'hello' | 'calendar' | 'wishlist' | 'santa' | 'lost';

/** Display width of each pose; heights follow the artwork. */
const GENIE_WIDTH = 130;

interface EmailLayoutProps {
  /** Short text shown in the inbox preview line (after the subject). */
  readonly preview: string;
  /** Genie shown above the content, to set the tone of the email. Left out for security emails. */
  readonly genie?: EmailGenie;
  readonly children: ReactNode;
}

/**
 * Outer shell shared by every Wishlist email: html/head, inbox preview,
 * "wishlist" lettering header, optional genie illustration and the legal footer.
 * Templates only provide their content sections as `children`.
 */
export function EmailLayout({ preview, genie, children }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head>
        {/* Web fonts where the client allows them (Apple Mail, iOS); others use the fallbacks in styles.ts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img alt="Wishlist" src={`${styles.assetsBaseUrl}/wordmark.png`} style={styles.logo} width="150" />
          </Section>

          {genie ? (
            <Section style={styles.genieSection}>
              <Img alt="" src={`${styles.assetsBaseUrl}/genie-${genie}.png`} style={styles.genie} width={GENIE_WIDTH} />
            </Section>
          ) : null}

          {children}

          <Section style={styles.footerSection}>
            <Text style={styles.footerText}>Ce mail a été envoyé automatiquement, merci de ne pas y répondre.</Text>
            <Text style={styles.footerText}>© Wishlist App - Partagez vos souhaits avec simplicité</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
