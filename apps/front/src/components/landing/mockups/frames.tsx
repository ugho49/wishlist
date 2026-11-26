import type { PropsWithChildren, ReactNode } from 'react';
import type { MockPerson } from './mock-data';

import LockIcon from '@mui/icons-material/Lock';
import { Avatar, alpha, styled } from '@mui/material';

/* Device frames and small helpers for the landing mockups. Mockups are pictures: they are
   `inert` (no focus, no clicks) and hidden from assistive technologies; each one comes with a
   visually-hidden summary instead. */

const FRAME_BORDER = '#E3ECEF';

const BrowserRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  backgroundColor: theme.palette.common.white,
  border: `1px solid ${FRAME_BORDER}`,
  boxShadow: `0 30px 60px -20px ${alpha(theme.palette.primary.main, 0.25)}`,
}));

const BrowserBar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  height: 36,
  padding: theme.spacing(0, 1.5),
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${FRAME_BORDER}`,
}));

const BrowserDots = styled('span')({
  display: 'flex',
  gap: 6,
  '& > span': {
    width: 9,
    height: 9,
    borderRadius: '50%',
    backgroundColor: '#D1D5DB',
  },
});

const UrlPill = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  margin: '0 auto',
  padding: '3px 12px',
  borderRadius: 999,
  fontSize: 12,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.common.white,
  border: `1px solid ${FRAME_BORDER}`,
  '& svg': {
    fontSize: 11,
  },
}));

/** Desktop browser window around a mockup. */
export const BrowserFrame = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <BrowserRoot className={className} aria-hidden inert>
    <BrowserBar>
      <BrowserDots>
        <span />
        <span />
        <span />
      </BrowserDots>
      <UrlPill>
        <LockIcon />
        wishlistapp.fr
      </UrlPill>
    </BrowserBar>
    {children}
  </BrowserRoot>
);

const PhoneRoot = styled('div', { shouldForwardProp: prop => prop !== 'phoneWidth' && prop !== 'fadeBottom' })<{
  phoneWidth: number | string;
  fadeBottom: boolean;
}>(({ theme, phoneWidth, fadeBottom }) => ({
  position: 'relative',
  width: phoneWidth,
  maxWidth: '100%',
  borderRadius: 34,
  border: '8px solid #1F2937',
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 30px 60px -24px ${alpha(theme.palette.primary.main, 0.35)}`,
  overflow: 'hidden',
  '& .phone-screen': {
    position: 'relative',
    overflow: 'hidden',
    ...(fadeBottom
      ? {
          maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
        }
      : {}),
  },
}));

const PhoneStatusBar = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 28,
  padding: theme.spacing(0, 2.5),
  fontSize: 11,
  fontWeight: 600,
  color: theme.palette.text.primary,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 6,
    left: '50%',
    width: 64,
    height: 16,
    transform: 'translateX(-50%)',
    borderRadius: 999,
    backgroundColor: '#1F2937',
  },
}));

const PhoneBattery = styled('span')({
  width: 18,
  height: 9,
  borderRadius: 3,
  border: '1.5px solid currentColor',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 1,
    right: 4,
    borderRadius: 1,
    backgroundColor: 'currentColor',
  },
});

export type PhoneFrameProps = PropsWithChildren<{
  /** Outer width, borders included. */
  width?: number | string;
  /** Fade the bottom of the screen out when the content is longer than the phone. */
  fadeBottom?: boolean;
  /** Fixed screen height, e.g. to crop a long list. */
  screenHeight?: number;
  className?: string;
}>;

/** Phone around a mobile mockup. */
export const PhoneFrame = ({ width = 260, fadeBottom = false, screenHeight, className, children }: PhoneFrameProps) => (
  <PhoneRoot phoneWidth={width} fadeBottom={fadeBottom} className={className} aria-hidden inert>
    <PhoneStatusBar>
      <span>9:41</span>
      <PhoneBattery />
    </PhoneStatusBar>
    <div className="phone-screen" style={screenHeight ? { height: screenHeight } : undefined}>
      {children}
    </div>
  </PhoneRoot>
);

const MockAvatarStyled = styled(Avatar, {
  shouldForwardProp: prop => prop !== 'avatarColor' && prop !== 'avatarSize',
})<{
  avatarColor: string;
  avatarSize: number;
}>(({ theme, avatarColor, avatarSize }) => ({
  width: avatarSize,
  height: avatarSize,
  fontSize: Math.round(avatarSize * 0.45),
  fontWeight: 600,
  color: theme.palette.getContrastText(avatarColor),
  backgroundColor: avatarColor,
}));

/** Coloured initial standing in for a profile picture. */
export const MockAvatar = ({ person, size = 28 }: { person: MockPerson; size?: number }) => (
  <MockAvatarStyled avatarColor={person.color} avatarSize={size}>
    {person.initial}
  </MockAvatarStyled>
);

export type MockNoteArrow = 'down' | 'up' | 'left' | 'right';

const NoteRoot = styled('span')(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 8px 20px -6px ${alpha(theme.palette.primary.main, 0.35)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: theme.palette.common.white,
    transform: 'rotate(45deg)',
  },
  '&.arrow-down::after': { bottom: -5, left: 20 },
  '&.arrow-up::after': { top: -5, left: 20 },
  '&.arrow-left::after': { left: -5, top: 'calc(50% - 5px)' },
  '&.arrow-right::after': { right: -5, top: 'calc(50% - 5px)' },
}));

/**
 * Annotation bubble pointing at a mockup detail. It is the page's only "explanation" style,
 * visually distinct from the app UI, so mockups never invent fake interface labels.
 */
export const MockNote = ({
  children,
  arrow = 'down',
  className,
}: {
  children: ReactNode;
  arrow?: MockNoteArrow;
  className?: string;
}) => (
  <NoteRoot className={[`arrow-${arrow}`, className].filter(Boolean).join(' ')} aria-hidden>
    {children}
  </NoteRoot>
);
