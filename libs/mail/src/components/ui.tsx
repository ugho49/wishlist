import type { CSSProperties, ReactNode } from 'react';
import type { CalloutVariant } from '../styles';

import { Button, Hr, Link, Section, Text } from 'react-email';

import * as styles from '../styles';

/** Small gold label above the page title. */
export function Eyebrow({ children }: { readonly children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

/** Centered serif page title. */
export function Heading({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return (
    <Text className="wl-h" style={{ ...styles.heading, ...style }}>
      {children}
    </Text>
  );
}

/** Body paragraph (left aligned by default). */
export function Paragraph({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <Text style={{ ...styles.paragraph, ...style }}>{children}</Text>;
}

/** Serif subsection title. */
export function SectionTitle({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <Text style={{ ...styles.sectionTitle, ...style }}>{children}</Text>;
}

/** Padded block inside the stationery card. */
export function ContentSection({
  children,
  compact,
  style,
}: {
  readonly children: ReactNode;
  readonly compact?: boolean;
  readonly style?: CSSProperties;
}) {
  return (
    <Section
      className="wl-pad"
      style={{ ...(compact ? styles.contentSectionCompact : styles.contentSection), ...style }}
    >
      {children}
    </Section>
  );
}

/** Event / wishlist title shown as a navy-tinted card. */
export function HighlightCard({
  children,
  detail,
  count,
}: {
  readonly children: ReactNode;
  readonly detail?: ReactNode;
  readonly count?: ReactNode;
}) {
  return (
    <Section className="wl-pad" style={styles.highlightWrap}>
      <Section style={styles.highlightInner}>
        <Text className="wl-highlight-title" style={styles.highlightTitle}>
          {children}
        </Text>
        {count !== undefined && <Text style={styles.highlightCount}>{count}</Text>}
        {detail !== undefined && <Text style={styles.highlightDetail}>{detail}</Text>}
      </Section>
    </Section>
  );
}

/** Tinted note with a left accent bar. */
export function Callout({
  variant,
  title,
  children,
}: {
  readonly variant: CalloutVariant;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <Section className="wl-pad" style={styles.calloutWrap}>
      <Section style={styles.calloutBox(variant)}>
        {title !== undefined && <Text style={styles.calloutTitle(variant)}>{title}</Text>}
        {typeof children === 'string' ? <Text style={styles.calloutText(variant)}>{children}</Text> : children}
      </Section>
    </Section>
  );
}

/** Body copy inside a Callout (use when the callout has several paragraphs). */
export function CalloutText({
  variant,
  children,
  style,
}: {
  readonly variant: CalloutVariant;
  readonly children: ReactNode;
  readonly style?: CSSProperties;
}) {
  return <Text style={{ ...styles.calloutText(variant), ...style }}>{children}</Text>;
}

/** Gold-bullet list row. */
export function FeatureItem({ children }: { readonly children: ReactNode }) {
  return (
    <Text style={styles.listItem}>
      <span style={styles.featureMark}>•</span>
      {children}
    </Text>
  );
}

/** Numbered step row (onboarding / checklists). */
export function Step({ n, children }: { readonly n: number; readonly children: ReactNode }) {
  return (
    <Text style={styles.listItem}>
      <span style={styles.stepNumber}>{n}.</span>
      {children}
    </Text>
  );
}

/** Label + value line (budget, description, …). */
export function DetailRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <Text style={styles.listItem}>
      <span style={styles.detailLabel}>{label}</span>
      {value}
    </Text>
  );
}

/** Hairline separator inside the card. */
export function Divider() {
  return (
    <Section className="wl-pad" style={styles.dividerWrap}>
      <Hr style={styles.divider} />
    </Section>
  );
}

/** Primary call-to-action button. */
export function PrimaryButton({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Button className="wl-btn" href={href} style={styles.button}>
      {children}
    </Button>
  );
}

/** "If the button does not work, copy this link" helper. */
export function ButtonFallback({ href }: { readonly href: string }) {
  return (
    <Text style={styles.buttonHint}>
      Si le bouton ne fonctionne pas, copiez ce lien :{' '}
      <Link href={href} style={styles.fallbackLink}>
        {href}
      </Link>
    </Text>
  );
}

/** Centered CTA: pill button + fallback link. */
export function CtaBlock({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Section className="wl-pad" style={styles.ctaSection}>
      <PrimaryButton href={href}>{children}</PrimaryButton>
      <ButtonFallback href={href} />
    </Section>
  );
}
