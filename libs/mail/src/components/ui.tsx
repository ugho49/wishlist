import type { CSSProperties, ReactNode } from 'react'

import { Button, Link, Section, Text } from '@react-email/components'

import * as styles from '../styles'

/** Centered page title. */
export function Heading({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <Text style={{ ...styles.heading, ...style }}>{children}</Text>
}

/** Body paragraph (left aligned by default). */
export function Paragraph({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <Text style={{ ...styles.paragraph, ...style }}>{children}</Text>
}

/** White content block. */
export function ContentSection({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <Section style={{ ...styles.contentSection, ...style }}>{children}</Section>
}

/** Colored highlight block (warning / success / info / ...). */
export function Callout({
  background,
  children,
  style,
}: {
  readonly background: string
  readonly children: ReactNode
  readonly style?: CSSProperties
}) {
  return <Section style={{ ...styles.callout(background), ...style }}>{children}</Section>
}

/** Primary call-to-action button rendered inside a white section. */
export function PrimaryButton({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Button href={href} style={styles.button}>
      {children}
    </Button>
  )
}

/** "If the button does not work, copy this link" helper shown under a button. */
export function ButtonFallback({ href }: { readonly href: string }) {
  return (
    <Text style={styles.buttonHint}>
      Si le bouton ne fonctionne pas, copiez ce lien :{' '}
      <Link href={href} style={{ color: styles.colors.primary, textDecoration: 'none' }}>
        {href}
      </Link>
    </Text>
  )
}
