import type { CSSProperties } from 'react';

/**
 * Shared email styles for Wishlist transactional emails, aligned on the app's genie branding:
 *   - primary:    #255376 (navy, headings & buttons)
 *   - mist:       #BFD4D7 / #E8F0F2 (blue-grey of the genie, soft surfaces)
 *   - text:       #55575d (body copy)
 *   - body bg:    #F2F6F7 (light mist)
 * Fredoka (headings) and Inter (body) load where the mail client allows web fonts; Gmail and
 * Outlook fall back to Trebuchet MS / Arial.
 */
export const colors = {
  primary: '#255376',
  mist: '#BFD4D7',
  mistLight: '#E8F0F2',
  text: '#55575d',
  hint: '#888888',
  footer: '#8a9aa3',
  white: '#ffffff',
  bodyBackground: '#F2F6F7',
} as const;

export const fontFamily = "'Inter', Arial, sans-serif";

export const headingFontFamily = "'Fredoka', 'Trebuchet MS', Arial, sans-serif";

/** Public assets (lettering, genie poses) live on the front: apps/front/public/email. */
export const assetsBaseUrl = 'https://wishlistapp.fr/email';

export const main: CSSProperties = {
  backgroundColor: colors.bodyBackground,
  fontFamily,
  margin: 0,
  padding: 0,
};

export const container: CSSProperties = {
  width: '600px',
  maxWidth: '100%',
  margin: '0 auto',
};

export const logoSection: CSSProperties = {
  padding: '28px 0 22px 0',
  textAlign: 'center',
};

export const genieSection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '32px 30px 0 30px',
  textAlign: 'center',
};

export const genie: CSSProperties = {
  margin: '0 auto',
  height: 'auto',
};

export const logo: CSSProperties = {
  margin: '0 auto',
};

export const contentSection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '40px 30px 25px 30px',
};

export const heading: CSSProperties = {
  color: colors.primary,
  fontFamily: headingFontFamily,
  fontSize: '26px',
  lineHeight: '32px',
  fontWeight: 600,
  textAlign: 'center',
  margin: '0 0 20px 0',
};

export const paragraph: CSSProperties = {
  color: colors.text,
  fontFamily,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 15px 0',
};

export const sectionTitle: CSSProperties = {
  color: colors.primary,
  fontFamily: headingFontFamily,
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 600,
  margin: '0 0 15px 0',
};

export const listItem: CSSProperties = {
  color: colors.text,
  fontFamily,
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 10px 0',
};

export const accent: CSSProperties = {
  color: colors.primary,
  fontWeight: 'bold',
};

export const buttonSection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '30px 30px 40px 30px',
  textAlign: 'center',
};

export const button: CSSProperties = {
  backgroundColor: colors.primary,
  color: colors.white,
  fontFamily,
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '10px',
  padding: '15px 40px',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
};

export const buttonHint: CSSProperties = {
  color: colors.hint,
  fontFamily,
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '15px 0 0 0',
};

export const footerSection: CSSProperties = {
  padding: '5px 0 10px 0',
  textAlign: 'center',
};

export const footerText: CSSProperties = {
  color: colors.footer,
  fontFamily,
  fontSize: '11px',
  lineHeight: '18px',
  margin: 0,
  padding: '15px 25px',
};

/**
 * Colored highlight blocks reused across templates (warning, success, info, ...).
 * Build one with `callout(backgroundColor)` and pair it with a matching text color.
 */
export const callout = (backgroundColor: string): CSSProperties => ({
  backgroundColor,
  padding: '20px 30px',
});

export const calloutTitle = (color: string): CSSProperties => ({
  color,
  fontFamily,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0 0 8px 0',
});

export const calloutText = (color: string): CSSProperties => ({
  color,
  fontFamily,
  fontSize: '13px',
  lineHeight: '19px',
  textAlign: 'center',
  margin: 0,
});

/** Highlight background/text color pairs used by the templates. */
export const palette = {
  warning: { background: '#fff3cd', text: '#856404' },
  success: { background: '#d4edda', text: '#155724' },
  danger: { background: '#f8d7da', text: '#721c24' },
  info: { background: colors.mistLight, text: colors.primary },
  neutral: { background: colors.mistLight, text: colors.primary },
  blue: { background: colors.mistLight, text: colors.primary },
  event: { background: colors.mistLight, text: colors.primary },
  reminder: { background: '#fff9e6', text: '#856404' },
} as const;
