import type { CSSProperties } from 'react'

/**
 * Shared email styles for Wishlist transactional emails.
 *
 * Palette mirrors the previous MJML templates so the visual identity stays
 * unchanged after the migration to react-email:
 *   - primary:    #224158 (deep blue, headings & buttons)
 *   - text:       #55575d (body copy)
 *   - footer:     #9d9d9d (legal footer)
 *   - body bg:    #F4F4F4
 */
export const colors = {
  primary: '#224158',
  text: '#55575d',
  hint: '#888888',
  footer: '#9d9d9d',
  white: '#ffffff',
  bodyBackground: '#F4F4F4',
} as const

export const fontFamily = 'Arial, sans-serif'

export const main: CSSProperties = {
  backgroundColor: colors.bodyBackground,
  fontFamily,
  margin: 0,
  padding: 0,
}

export const container: CSSProperties = {
  width: '600px',
  maxWidth: '100%',
  margin: '0 auto',
}

export const logoSection: CSSProperties = {
  padding: '20px 0',
  textAlign: 'center',
}

export const logo: CSSProperties = {
  margin: '0 auto',
}

export const contentSection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '40px 30px 25px 30px',
}

export const heading: CSSProperties = {
  color: colors.primary,
  fontFamily,
  fontSize: '26px',
  lineHeight: '32px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0 0 20px 0',
}

export const paragraph: CSSProperties = {
  color: colors.text,
  fontFamily,
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 15px 0',
}

export const sectionTitle: CSSProperties = {
  color: colors.primary,
  fontFamily,
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

export const listItem: CSSProperties = {
  color: colors.text,
  fontFamily,
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 10px 0',
}

export const accent: CSSProperties = {
  color: colors.primary,
  fontWeight: 'bold',
}

export const buttonSection: CSSProperties = {
  backgroundColor: colors.white,
  padding: '30px 30px 40px 30px',
  textAlign: 'center',
}

export const button: CSSProperties = {
  backgroundColor: colors.primary,
  color: colors.white,
  fontFamily,
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '6px',
  padding: '15px 40px',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
}

export const buttonHint: CSSProperties = {
  color: colors.hint,
  fontFamily,
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '15px 0 0 0',
}

export const footerSection: CSSProperties = {
  padding: '5px 0 10px 0',
  textAlign: 'center',
}

export const footerText: CSSProperties = {
  color: colors.footer,
  fontFamily,
  fontSize: '11px',
  lineHeight: '18px',
  margin: 0,
  padding: '15px 25px',
}

/**
 * Colored highlight blocks reused across templates (warning, success, info, ...).
 * Build one with `callout(backgroundColor)` and pair it with a matching text color.
 */
export const callout = (backgroundColor: string): CSSProperties => ({
  backgroundColor,
  padding: '20px 30px',
})

export const calloutTitle = (color: string): CSSProperties => ({
  color,
  fontFamily,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '0 0 8px 0',
})

export const calloutText = (color: string): CSSProperties => ({
  color,
  fontFamily,
  fontSize: '13px',
  lineHeight: '19px',
  textAlign: 'center',
  margin: 0,
})

/** Highlight background/text color pairs used by the templates. */
export const palette = {
  warning: { background: '#fff3cd', text: '#856404' },
  success: { background: '#d4edda', text: '#155724' },
  danger: { background: '#f8d7da', text: '#721c24' },
  info: { background: '#d1ecf1', text: '#0c5460' },
  neutral: { background: '#f8f9fa', text: colors.primary },
  blue: { background: '#e7f3ff', text: '#004085' },
  event: { background: '#f0f4f8', text: colors.primary },
  reminder: { background: '#fff9e6', text: '#856404' },
} as const
