export const colors = {
  primary: '#224158',
  text: '#55575d',
  lightGray: '#888888',
  white: '#ffffff',
  bgGray: '#f8f9fa',
  bgBlue: '#f0f4f8',
  bgGreen: '#d4edda',
  textGreen: '#155724',
  bgYellow: '#fff3cd',
  textYellow: '#856404',
  bgRed: '#f8d7da',
  textRed: '#721c24',
  bgInfo: '#d1ecf1',
  textInfo: '#0c5460',
  bgHighlight: '#fff9e6',
  bgBlueLight: '#e7f3ff',
  textBlueLight: '#004085',
} as const

export const heading: React.CSSProperties = {
  color: colors.primary,
  fontSize: '26px',
  lineHeight: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 0 20px 0',
  margin: 0,
}

export const paragraph: React.CSSProperties = {
  color: colors.text,
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 0 15px 0',
  margin: 0,
}

export const contentSection: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: '40px 30px 25px 30px',
}

export const ctaSection: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: '30px 30px 40px 30px',
  textAlign: 'center' as const,
}

export const button: React.CSSProperties = {
  backgroundColor: colors.primary,
  color: colors.white,
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '6px',
  padding: '15px 40px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const fallbackLink: React.CSSProperties = {
  color: colors.lightGray,
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  padding: '15px 0 0 0',
  margin: 0,
}

export const link: React.CSSProperties = {
  color: colors.primary,
  textDecoration: 'none',
}

export const subHeading: React.CSSProperties = {
  color: colors.primary,
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 'bold',
  padding: '0 0 15px 0',
  margin: 0,
}

export const listItem: React.CSSProperties = {
  color: colors.text,
  fontSize: '15px',
  lineHeight: '22px',
  padding: '0 0 10px 0',
  margin: 0,
}

export const tipSection: React.CSSProperties = {
  backgroundColor: colors.bgGray,
  padding: '20px 30px',
}

export const tipHeading: React.CSSProperties = {
  color: colors.primary,
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 'bold',
  padding: '0 0 10px 0',
  margin: 0,
}

export const tipText: React.CSSProperties = {
  color: colors.text,
  fontSize: '14px',
  lineHeight: '21px',
  margin: 0,
}

export const warningSection: React.CSSProperties = {
  backgroundColor: colors.bgYellow,
  padding: '20px 30px',
}

export const warningHeading: React.CSSProperties = {
  color: colors.textYellow,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 0 8px 0',
  margin: 0,
}

export const warningText: React.CSSProperties = {
  color: colors.textYellow,
  fontSize: '13px',
  lineHeight: '19px',
  textAlign: 'center' as const,
  margin: 0,
}

export const successSection: React.CSSProperties = {
  backgroundColor: colors.bgGreen,
  padding: '20px 30px',
}

export const successHeading: React.CSSProperties = {
  color: colors.textGreen,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 0 8px 0',
  margin: 0,
}

export const successText: React.CSSProperties = {
  color: colors.textGreen,
  fontSize: '13px',
  lineHeight: '19px',
  textAlign: 'center' as const,
  margin: 0,
}

export const infoSection: React.CSSProperties = {
  backgroundColor: colors.bgInfo,
  padding: '20px 30px',
}

export const infoHeading: React.CSSProperties = {
  color: colors.textInfo,
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  padding: '0 0 8px 0',
  margin: 0,
}

export const infoText: React.CSSProperties = {
  color: colors.textInfo,
  fontSize: '13px',
  lineHeight: '19px',
  textAlign: 'center' as const,
  margin: 0,
}

export const highlightSection = (bgColor: string): React.CSSProperties => ({
  backgroundColor: bgColor,
  padding: '20px 30px',
  textAlign: 'center' as const,
})

export const highlightText = (color: string): React.CSSProperties => ({
  color,
  fontSize: '22px',
  lineHeight: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: 0,
})

export const securitySection: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: '25px 30px 35px 30px',
}

export const securityHeading: React.CSSProperties = {
  color: colors.primary,
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 'bold',
  padding: '0 0 12px 0',
  margin: 0,
}

export const securityText: React.CSSProperties = {
  color: colors.text,
  fontSize: '14px',
  lineHeight: '21px',
  margin: 0,
}
