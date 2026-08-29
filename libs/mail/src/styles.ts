import type { CSSProperties } from 'react';

/**
 * Shared email styles — “gift stationery” identity.
 *
 * Navy from the Wishlist landing, cream canvas, gold hairline accents.
 * Typography is email-safe: Georgia for titles, system sans for body.
 */
export const colors = {
  navy: '#255376',
  navyDeep: '#1a3a52',
  gold: '#C4A574',
  cream: '#F3EEE6',
  card: '#FFFCFA',
  ink: '#243040',
  muted: '#5C6570',
  hint: '#8A847A',
  footer: '#8A847A',
  white: '#ffffff',
  rule: '#E8E0D4',
} as const;

export const headingFont = "Georgia, 'Iowan Old Style', Palatino, 'Palatino Linotype', serif";
export const bodyFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export const calloutVariants = {
  warning: { background: '#F8F1E4', accent: '#C4A574', text: '#6B5428' },
  success: { background: '#E8F0E9', accent: '#4A7C59', text: '#2F5D3A' },
  danger: { background: '#F8E8E6', accent: '#C47070', text: '#8B3A3A' },
  info: { background: '#E8EEF3', accent: '#255376', text: '#1a3a52' },
  tip: { background: '#F7F3EC', accent: '#C4A574', text: '#243040' },
  highlight: { background: '#EEF3F7', accent: '#255376', text: '#1a3a52' },
} as const;

export type CalloutVariant = keyof typeof calloutVariants;

export const main: CSSProperties = {
  backgroundColor: colors.cream,
  fontFamily: bodyFont,
  margin: 0,
  padding: 0,
  width: '100%',
  WebkitTextSizeAdjust: '100%',
};

export const bodyInner: CSSProperties = {
  backgroundColor: colors.cream,
  padding: '32px 16px 40px 16px',
};

export const container: CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
};

export const logoSection: CSSProperties = {
  padding: '8px 8px 28px 8px',
  textAlign: 'center',
};

export const logoIcon: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  marginRight: '12px',
};

export const logoWordmark: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
};

export const card: CSSProperties = {
  backgroundColor: colors.card,
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${colors.rule}`,
  boxShadow: '0 12px 32px rgba(26, 58, 82, 0.08)',
  width: '100%',
};

export const ribbon: CSSProperties = {
  backgroundColor: colors.navy,
  height: '6px',
  lineHeight: '6px',
  fontSize: '1px',
};

export const contentSection: CSSProperties = {
  backgroundColor: colors.card,
  padding: '36px 40px 8px 40px',
};

export const contentSectionCompact: CSSProperties = {
  backgroundColor: colors.card,
  padding: '12px 40px 8px 40px',
};

export const eyebrow: CSSProperties = {
  color: colors.gold,
  fontFamily: bodyFont,
  fontSize: '11px',
  lineHeight: '16px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textAlign: 'center',
  margin: '0 0 12px 0',
};

export const heading: CSSProperties = {
  color: colors.navyDeep,
  fontFamily: headingFont,
  fontSize: '28px',
  lineHeight: '36px',
  fontWeight: 'normal',
  textAlign: 'center',
  margin: '0 0 16px 0',
};

export const paragraph: CSSProperties = {
  color: colors.ink,
  fontFamily: bodyFont,
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 14px 0',
};

export const sectionTitle: CSSProperties = {
  color: colors.navyDeep,
  fontFamily: headingFont,
  fontSize: '18px',
  lineHeight: '26px',
  fontWeight: 'normal',
  margin: '8px 0 14px 0',
};

export const listItem: CSSProperties = {
  color: colors.ink,
  fontFamily: bodyFont,
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 10px 0',
};

export const featureMark: CSSProperties = {
  color: colors.gold,
  fontFamily: headingFont,
  fontSize: '14px',
  lineHeight: '24px',
  paddingRight: '10px',
};

export const stepNumber: CSSProperties = {
  color: colors.navy,
  fontFamily: headingFont,
  fontSize: '16px',
  lineHeight: '24px',
  fontWeight: 'bold',
  paddingRight: '10px',
};

export const detailLabel: CSSProperties = {
  color: colors.navy,
  fontFamily: bodyFont,
  fontSize: '15px',
  fontWeight: 700,
  paddingRight: '6px',
};

export const highlightWrap: CSSProperties = {
  backgroundColor: colors.card,
  padding: '12px 40px 20px 40px',
};

export const highlightInner: CSSProperties = {
  backgroundColor: calloutVariants.highlight.background,
  borderLeft: `4px solid ${colors.navy}`,
  borderRadius: '10px',
  padding: '20px 24px',
  textAlign: 'center',
};

export const highlightTitle: CSSProperties = {
  color: colors.navyDeep,
  fontFamily: headingFont,
  fontSize: '22px',
  lineHeight: '30px',
  fontWeight: 'normal',
  textAlign: 'center',
  margin: 0,
};

export const highlightDetail: CSSProperties = {
  color: colors.navy,
  fontFamily: bodyFont,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 600,
  textAlign: 'center',
  margin: '8px 0 0 0',
};

export const highlightCount: CSSProperties = {
  color: colors.navyDeep,
  fontFamily: headingFont,
  fontSize: '36px',
  lineHeight: '42px',
  textAlign: 'center',
  margin: '10px 0 0 0',
};

export const calloutWrap: CSSProperties = {
  backgroundColor: colors.card,
  padding: '8px 40px 12px 40px',
};

export const calloutBox = (variant: CalloutVariant): CSSProperties => {
  const v = calloutVariants[variant];
  return {
    backgroundColor: v.background,
    borderLeft: `4px solid ${v.accent}`,
    borderRadius: '10px',
    padding: '16px 20px',
  };
};

export const calloutTitle = (variant: CalloutVariant): CSSProperties => ({
  color: calloutVariants[variant].text,
  fontFamily: bodyFont,
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  margin: '0 0 8px 0',
});

export const calloutText = (variant: CalloutVariant): CSSProperties => ({
  color: calloutVariants[variant].text,
  fontFamily: bodyFont,
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
});

export const ctaSection: CSSProperties = {
  backgroundColor: colors.card,
  padding: '24px 40px 40px 40px',
  textAlign: 'center',
};

export const button: CSSProperties = {
  backgroundColor: colors.navy,
  color: colors.white,
  fontFamily: bodyFont,
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  borderRadius: '999px',
  padding: '14px 32px',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: '20px',
  maxWidth: '100%',
  boxSizing: 'border-box',
};

export const buttonHint: CSSProperties = {
  color: colors.hint,
  fontFamily: bodyFont,
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center',
  margin: '16px 0 0 0',
};

export const fallbackLink: CSSProperties = {
  color: colors.navy,
  textDecoration: 'underline',
  wordBreak: 'break-all',
};

export const footerSection: CSSProperties = {
  padding: '28px 24px 8px 24px',
  textAlign: 'center',
};

export const footerText: CSSProperties = {
  color: colors.footer,
  fontFamily: bodyFont,
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 6px 0',
};

export const footerLink: CSSProperties = {
  color: colors.navy,
  fontFamily: bodyFont,
  fontSize: '12px',
  lineHeight: '18px',
  textDecoration: 'none',
  fontWeight: 600,
};

export const dividerWrap: CSSProperties = {
  backgroundColor: colors.card,
  padding: '8px 40px',
};

export const divider: CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${colors.rule}`,
  margin: 0,
};

/**
 * Media queries for clients that honor `<style>` (Apple Mail, Gmail web, the
 * react-email preview). Inline styles stay as the desktop/Outlook fallback.
 * Selectors target the `<td>` that react-email `Section` puts padding on.
 */
export const responsiveCss = `
  html, body { width: 100% !important; margin: 0 !important; padding: 0 !important; }
  img { max-width: 100% !important; height: auto !important; }
  @media only screen and (max-width: 620px) {
    .wl-outer > tbody > tr > td {
      padding: 16px 8px 24px 8px !important;
    }
    .wl-pad > tbody > tr > td {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    .wl-card { width: 100% !important; max-width: 100% !important; }
    .wl-h {
      font-size: 24px !important;
      line-height: 30px !important;
    }
    .wl-highlight-title {
      font-size: 18px !important;
      line-height: 26px !important;
    }
    .wl-btn {
      display: block !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }
`;
