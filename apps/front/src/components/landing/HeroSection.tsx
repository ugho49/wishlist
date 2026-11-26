import type { RefObject } from 'react';
import type { MockPerson } from './mockups/mock-data';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ForestIcon from '@mui/icons-material/Forest';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RedeemIcon from '@mui/icons-material/Redeem';
import { alpha, Button, Container, keyframes, styled, useMediaQuery } from '@mui/material';
import { createLink } from '@tanstack/react-router';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { brandColors } from '../../theme';
import { getCountdown } from '../../utils/countdown.utils';
import { Genie } from '../common/Genie';
import { Logo } from '../common/Logo';
import { MetaChip } from '../common/PageHero';
import { VisuallyHidden } from '../common/VisuallyHidden';
import { BrowserFrame, MockAvatar, MockNote, PhoneFrame } from './mockups/frames';
import { MockEventHeader } from './mockups/MockEventHeader';
import { MockItemCard } from './mockups/MockItemCard';
import { leaBirthdayDate, leaListTitle, leaWishes, people } from './mockups/mock-data';
import { prefersReducedMotion, useInView } from './useInView';

const FRAME_BORDER = '#E3ECEF';

const REASSURANCES = ['Gratuit et sans publicité', 'Connexion avec Google', "S'installe sur votre téléphone"];

const SIDEBAR_ENTRIES = [
  { label: 'Évènements', icon: <CalendarMonthIcon />, active: true },
  { label: 'Mes listes', icon: <FormatListBulletedIcon />, active: false },
  { label: 'Secret Santa', icon: <ForestIcon />, active: false },
  { label: 'Cadeaux réservés', icon: <RedeemIcon />, active: false },
];

/** Who reserves the camera during the scene. */
const INES: MockPerson[] = [people.ines];
const NOBODY: MockPerson[] = [];

/* Reservation scene timeline (ms): the pointer starts once the entrance is over, glides to
   "Réserver", clicks, then the card turns reserved and the pointer fades away. */
const SCENE_START = 1200;
const GLIDE_DURATION = 1400;
const CLICK_DURATION = 220;
const FADE_DURATION = 400;

/* --------------------------------- Animations --------------------------------- */

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const noteIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// The genie rises from behind the frame edge (its perch clips everything below that edge)
const peekUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const sparkleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const pointerGlide = keyframes`
  from {
    opacity: 0;
    transform: translate(calc(var(--pointer-x) + 80px), calc(var(--pointer-y) - 90px));
  }
  20% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: translate(var(--pointer-x), var(--pointer-y));
  }
`;

const touchIn = keyframes`
  from {
    opacity: 0;
    transform: translate(calc(var(--pointer-x) - 14px), calc(var(--pointer-y) - 14px)) scale(1.6);
  }
  to {
    opacity: 1;
    transform: translate(calc(var(--pointer-x) - 14px), calc(var(--pointer-y) - 14px)) scale(1);
  }
`;

/**
 * Entrance of a preview, played once when it reaches the viewport (`.entered` on the scene root):
 * the frame rises, the phone follows, the genie peeks over the edge, then the note pops in.
 * With reduced motion, nothing is hidden and nothing moves.
 */
const sceneEntrance = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&:not(.entered) .enter-rise, &:not(.entered) .enter-note, &:not(.entered) .enter-sparkle': {
      opacity: 0,
    },
    '&:not(.entered) .enter-peek': {
      transform: 'translateY(100%)',
    },
    '&.entered .enter-rise': {
      animation: `${riseIn} 400ms ease-out both`,
    },
    '&.entered .enter-rise.delayed': {
      animationDelay: '150ms',
    },
    '&.entered .enter-peek': {
      animation: `${peekUp} 520ms cubic-bezier(0.34, 1.4, 0.64, 1) 450ms both`,
    },
    '&.entered .enter-note': {
      animation: `${noteIn} 300ms cubic-bezier(0.34, 1.56, 0.64, 1) 900ms both`,
    },
    '&.entered .enter-sparkle': {
      animation: `${sparkleIn} 360ms ease-out both`,
    },
  },
} as const;

/* ----------------------------------- Layout ----------------------------------- */

const HeroRoot = styled('section')(({ theme }) => ({
  position: 'relative',
  scrollMarginTop: 80,
  overflow: 'clip',
  backgroundColor: theme.palette.common.white,
  // Very soft halo behind the preview
  backgroundImage: `radial-gradient(360px 320px at 50% 78%, ${brandColors.mistLight} 0%, transparent 70%)`,
  [theme.breakpoints.up('md')]: {
    backgroundImage: `radial-gradient(640px 420px at 70% 45%, ${brandColors.mistLight} 0%, transparent 70%)`,
  },
}));

const HeroGrid = styled(Container)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  alignItems: 'center',
  rowGap: theme.spacing(5),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(7),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
    columnGap: theme.spacing(6),
    minHeight: 'min(calc(100vh - 64px), 720px)',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
  },
}));

const HeroCopy = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 600,
  marginInline: 'auto',
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    maxWidth: 'none',
    marginInline: 0,
    textAlign: 'left',
  },
}));

/* Each occasion is glued together with non-breaking spaces, so the line only breaks between
   occasions, two and two. The radius is a full pill on one line but stays a rounded box,
   not a balloon, if a very narrow screen still needs two lines. */
const OccasionsLine = styled('p')(({ theme }) => ({
  margin: theme.spacing(0, 0, 2),
  padding: '6px 12px',
  borderRadius: 16,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.4,
  textWrap: 'balance',
  color: theme.palette.primary.main,
  backgroundColor: brandColors.mistLight,
  [theme.breakpoints.up('lg')]: {
    padding: '6px 14px',
    fontSize: 13,
  },
}));

const HeroTitle = styled('h1')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '2.25rem',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
  color: theme.palette.primary.main,
  textWrap: 'balance',
  // The copy column is only ~335px wide at the start of md
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
    lineHeight: 1.1,
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '3.5rem',
  },
}));

// Mist stroke behind the words, like a highlighter (follows the line breaks)
const TitleHighlight = styled('span')({
  backgroundImage: `linear-gradient(${brandColors.mist}, ${brandColors.mist})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 0.18em',
  backgroundPosition: '0 88%',
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
});

const HeroSubtitle = styled('p')(({ theme }) => ({
  maxWidth: 520,
  margin: theme.spacing(2.5, 0, 0),
  fontSize: '1.0625rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('md')]: {
    fontSize: 19,
  },
}));

const CtaRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1),
  width: '100%',
  maxWidth: 420,
  marginTop: theme.spacing(3.5),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    // The secondary button goes below when the column is too narrow, instead of sliding under the preview
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    width: 'auto',
    maxWidth: 'none',
    marginTop: theme.spacing(4),
  },
}));

const PrimaryCtaStyled = styled(Button)({
  padding: '12px 24px',
  borderRadius: 12,
  fontWeight: 600,
  whiteSpace: 'nowrap',
});

/** Router link with the look of the main button. */
const PrimaryCtaLink = createLink(PrimaryCtaStyled);

const SecondaryCta = styled(Button)({
  padding: '12px 16px',
  borderRadius: 12,
  fontWeight: 600,
  whiteSpace: 'nowrap',
});

const ReassuranceList = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  columnGap: theme.spacing(2.5),
  rowGap: theme.spacing(1),
  margin: theme.spacing(3, 0, 0),
  padding: 0,
  listStyle: 'none',
  '& > li': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
  '& svg': {
    fontSize: 18,
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
  },
}));

const HeroVisual = styled('div')({
  position: 'relative',
  minWidth: 0,
});

/* ------------------------------- Shared mockup bits ------------------------------- */

/** Holds the genie on the top edge of a frame: its flat bottom overlaps the edge by 2px. */
const GeniePerch = styled('div')({
  position: 'absolute',
  zIndex: 4,
  bottom: 'calc(100% - 2px)',
  right: 36,
  display: 'flex',
  pointerEvents: 'none',
  // Hides what is below the frame edge, so the genie peeks up from behind it
  clipPath: 'inset(-80px -80px 0 -80px)',
  '&.on-phone': {
    right: 22,
  },
});

const SparkleStyled = styled('svg')({
  position: 'absolute',
  color: brandColors.mist,
});

type SparkleSpot = { top: string; left: string; size: number; delay: number };

/** Three little four-pointed sparkles around the genie (mist, never yellow). */
const SPARKLE_SPOTS: SparkleSpot[] = [
  { top: '4%', left: '-14%', size: 14, delay: 950 },
  { top: '-8%', left: '96%', size: 11, delay: 1050 },
  { top: '-18%', left: '32%', size: 8, delay: 1150 },
];

const PeekingGenie = ({ size, onPhone = false }: { size: number; onPhone?: boolean }) => (
  <GeniePerch className={clsx(onPhone && 'on-phone')}>
    <Genie variant="peek" size={size} eager className="enter-peek" />
    {SPARKLE_SPOTS.map(spot => (
      <SparkleStyled
        key={`${spot.top}-${spot.left}`}
        className="enter-sparkle"
        viewBox="0 0 24 24"
        aria-hidden
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.size,
          height: spot.size,
          animationDelay: `${spot.delay}ms`,
        }}
      >
        <path
          d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z"
          fill="currentColor"
        />
      </SparkleStyled>
    ))}
  </GeniePerch>
);

/** Wraps a card to pin things to it (note, pointer) outside its clipped box. */
const CardSlot = styled('div')({
  position: 'relative',
  minWidth: 0,
  '--pointer-x': '60px',
  '--pointer-y': '60px',
  '&.phase-clicking button': {
    transform: 'scale(0.95)',
  },
});

// Arrow points at the "Réservé" badge, centred at the top of the card
const SecretNote = styled(MockNote)({
  position: 'absolute',
  zIndex: 4,
  bottom: 'calc(100% + 2px)',
  left: 'calc(50% - 25px)',
  transformOrigin: '25px 100%',
});

/* In the phone, the note sits in the gap above the card. The compact card shows "Réservé" right
   of the hearts (about 70px from the card's right edge), so the note hangs from the right and
   its arrow drops onto that tag. */
const PhoneSecretNote = styled(SecretNote)({
  left: 'auto',
  right: 12,
  transformOrigin: 'calc(100% - 59px) 100%',
  '&.arrow-down::after': {
    left: 'auto',
    right: 54,
  },
});

/* ------------------------------ Reservation scene ------------------------------ */

type ScenePhase = 'idle' | 'gliding' | 'clicking' | 'reserved' | 'settled';

/** Puts the pointer target (CSS variables) on the centre of the card's button. */
const aimAtButton = (slot: HTMLElement | null) => {
  const button = slot?.querySelector('button');
  if (!slot || !button) return;
  const slotBox = slot.getBoundingClientRect();
  const buttonBox = button.getBoundingClientRect();
  slot.style.setProperty('--pointer-x', `${buttonBox.left - slotBox.left + buttonBox.width / 2}px`);
  slot.style.setProperty('--pointer-y', `${buttonBox.top - slotBox.top + buttonBox.height / 2}px`);
};

/**
 * Plays the reservation once each time the card comes into view, and rewinds it once the
 * whole preview has left the screen (so the visitor never sees it rewind).
 * With reduced motion, the card is reserved from the start.
 */
const useReservationScene = (slotRef: RefObject<HTMLElement | null>, cardInView: boolean, previewInView: boolean) => {
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<ScenePhase>(() => (prefersReducedMotion() ? 'settled' : 'idle'));

  useEffect(() => {
    if (cardInView) setPlaying(true);
  }, [cardInView]);

  useEffect(() => {
    if (!previewInView) setPlaying(false);
  }, [previewInView]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase('settled');
      return;
    }
    if (!playing) {
      setPhase('idle');
      return;
    }

    const timeline: [number, ScenePhase][] = [
      [SCENE_START, 'gliding'],
      [SCENE_START + GLIDE_DURATION, 'clicking'],
      [SCENE_START + GLIDE_DURATION + CLICK_DURATION, 'reserved'],
      [SCENE_START + GLIDE_DURATION + CLICK_DURATION + FADE_DURATION, 'settled'],
    ];
    const timers = timeline.map(([delay, next]) =>
      window.setTimeout(() => {
        if (next === 'gliding') aimAtButton(slotRef.current);
        setPhase(next);
      }, delay),
    );
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [playing, slotRef]);

  return phase;
};

const PointerCursorStyled = styled('svg')({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 6,
  width: 20,
  height: 24,
  overflow: 'visible',
  pointerEvents: 'none',
  transformOrigin: '2px 2px',
  transform: 'translate(var(--pointer-x), var(--pointer-y))',
  filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25))',
  transition: 'transform 120ms ease-out, opacity 300ms ease',
  '&.gliding': {
    animation: `${pointerGlide} ${GLIDE_DURATION}ms cubic-bezier(0.45, 0, 0.2, 1) both`,
  },
  '&.clicking': {
    transform: 'translate(var(--pointer-x), var(--pointer-y)) scale(0.85)',
  },
  '&.reserved': {
    opacity: 0,
  },
});

// On the phone, a finger tap instead of a mouse pointer
const TouchDotStyled = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 6,
  boxSizing: 'border-box',
  width: 28,
  height: 28,
  borderRadius: '50%',
  pointerEvents: 'none',
  border: `2px solid ${theme.palette.common.white}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.25),
  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
  transform: 'translate(calc(var(--pointer-x) - 14px), calc(var(--pointer-y) - 14px))',
  transition: 'transform 150ms ease-out, opacity 300ms ease',
  '&.gliding': {
    animation: `${touchIn} 360ms ease-out ${GLIDE_DURATION - 400}ms both`,
  },
  '&.clicking': {
    transform: 'translate(calc(var(--pointer-x) - 14px), calc(var(--pointer-y) - 14px)) scale(0.8)',
  },
  '&.reserved': {
    opacity: 0,
    transform: 'translate(calc(var(--pointer-x) - 14px), calc(var(--pointer-y) - 14px)) scale(1.4)',
  },
}));

const ScenePointer = ({ touch, phase }: { touch: boolean; phase: ScenePhase }) =>
  touch ? (
    <TouchDotStyled className={phase} />
  ) : (
    <PointerCursorStyled className={phase} viewBox="0 0 20 24" aria-hidden>
      <path
        d="M2.5 2v17.4l4.3-4.1 2.9 6.6 3.2-1.4-2.9-6.5h6z"
        fill="#fff"
        stroke="#1F2937"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </PointerCursorStyled>
  );

type CameraReservationProps = {
  /** Phone layout (horizontal card, finger tap). */
  compact?: boolean;
  imageHeight?: number;
  /** Whether any part of the preview is on screen; the scene rewinds once it is not. */
  previewInView: boolean;
};

/** The camera card, which Inès reserves while the visitor watches. */
const CameraReservation = ({ compact = false, imageHeight, previewInView }: CameraReservationProps) => {
  const [slotRef, cardInView] = useInView<HTMLDivElement>({ threshold: 0.6, once: false });
  const phase = useReservationScene(slotRef, cardInView, previewInView);
  const reserved = phase === 'reserved' || phase === 'settled';
  const showPointer = phase === 'gliding' || phase === 'clicking' || phase === 'reserved';

  return (
    <CardSlot ref={slotRef} className={`phase-${phase}`}>
      <MockItemCard
        wish={leaWishes.camera}
        view="guest"
        compact={compact}
        imageHeight={imageHeight}
        takers={reserved ? INES : NOBODY}
        popReserved
      />
      {showPointer ? <ScenePointer touch={compact} phase={phase} /> : null}
    </CardSlot>
  );
};

type PreviewProps = {
  previewInView: boolean;
};

/* ------------------------------- Desktop preview ------------------------------- */

const CARD_IMAGE_HEIGHT = 92;
const SIDEBAR_WIDTH = 140;
const DESKTOP_PHONE_WIDTH = 210;

const DesktopScene = styled('div')({
  position: 'relative',
  width: 'calc(100% - 40px)',
  maxWidth: 620,
  // Room for the genie above the frame and for the phone sticking out below and to the left
  margin: '112px 0 56px auto',
  ...sceneEntrance,
});

const BrowserBody = styled('div')({
  display: 'grid',
  gridTemplateColumns: `${SIDEBAR_WIDTH}px minmax(0, 1fr)`,
});

const MockSidebar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '14px 6px',
  overflow: 'hidden',
  borderRight: `1px solid ${FRAME_BORDER}`,
  backgroundColor: theme.palette.common.white,
}));

const SidebarLogo = styled('div')({
  margin: '2px 0 12px 6px',
});

const SidebarEntry = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 6px',
  borderRadius: 999,
  fontSize: 11,
  whiteSpace: 'nowrap',
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: 12,
  },
  '&.active': {
    fontWeight: 600,
    color: theme.palette.primary.main,
    backgroundColor: brandColors.mistLight,
  },
}));

const MockMain = styled('div')(({ theme }) => ({
  minWidth: 0,
  padding: '16px 14px 18px',
  backgroundColor: theme.palette.grey[50],
}));

const MockListHeader = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  // Room for the note above the first card
  marginBottom: 42,
});

const MockListTitle = styled('span')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1.2,
  color: theme.palette.primary.main,
}));

/* The real card pieces are sized for a full page; scale their text and controls down so three
   cards fit in the browser window, like a screenshot would. */
const BrowserCardsGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  '& > .wide-only': {
    display: 'none',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    '& > .wide-only': {
      display: 'flex',
    },
  },
  '& .item-content': {
    padding: '8px 10px 10px',
    gap: 2,
  },
  '& .item-content > div:first-of-type': {
    fontSize: '0.85rem',
    marginBottom: 2,
  },
  '& .item-content > p': {
    fontSize: '0.72rem',
  },
  '& .item-content .MuiButton-root': {
    minWidth: 0,
    height: 28,
    padding: '4px 10px',
    borderRadius: 10,
    fontSize: '0.72rem',
    '& .MuiButton-startIcon': {
      marginRight: 4,
    },
    '& .MuiButton-startIcon > svg': {
      fontSize: 14,
    },
  },
  '& .MuiRating-root': {
    fontSize: '0.8rem',
  },
  // "Réservé" badge
  '& :has(> .MuiAvatarGroup-root)': {
    top: 8,
    gap: 4,
    maxWidth: 'calc(100% - 12px)',
    padding: '3px 6px 3px 7px',
    fontSize: '0.68rem',
    '& > svg': {
      fontSize: '0.8rem',
    },
  },
  '& .MuiAvatarGroup-root .MuiAvatar-root': {
    width: 18,
    height: 18,
    marginLeft: -6,
    fontSize: '0.55rem',
    '&:last-child': {
      marginLeft: 0,
    },
  },
}));

const DesktopPhone = styled(PhoneFrame)({
  position: 'absolute',
  zIndex: 3,
  // Overlaps the sidebar only: its right edge stops 10px past the sidebar, before the first card
  left: SIDEBAR_WIDTH + 10 - DESKTOP_PHONE_WIDTH,
  bottom: -48,
  '& .phone-screen': {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 10px 14px',
  },
});

// Same layout as the app's mobile event header: emoji and title on a row, the chips below
const PhoneEventHeader = styled(MockEventHeader)({
  flexWrap: 'wrap',
  '& > div': {
    display: 'contents',
  },
  '& > div > div:first-of-type': {
    flex: 1,
    minWidth: 0,
  },
  '& > div > div:last-of-type': {
    flexBasis: '100%',
    marginTop: 0,
  },
});

const PhoneSectionLabel = styled('span')(({ theme }) => ({
  margin: '14px 0 6px',
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

// Like WishlistCardWithOwner: the owner's name under the title, no wish count
const PhoneWishlistCard = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 10,
  rowGap: 2,
  padding: 8,
  borderRadius: 14,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
  '& > .MuiAvatar-root': {
    gridRow: 'span 2',
  },
}));

const PhoneWishlistTitle = styled('span')(({ theme }) => ({
  alignSelf: 'end',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const PhoneWishlistOwner = styled('span')(({ theme }) => ({
  alignSelf: 'start',
  fontSize: '0.7rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

const DesktopPreview = ({ previewInView }: PreviewProps) => {
  const [sceneRef, entered] = useInView<HTMLDivElement>({ threshold: 0.25 });

  return (
    <DesktopScene ref={sceneRef} className={clsx(entered && 'entered')}>
      <BrowserFrame className="enter-rise">
        <BrowserBody>
          <MockSidebar>
            <SidebarLogo>
              <Logo variant="wordmark" tone="light" height={16} />
            </SidebarLogo>
            {SIDEBAR_ENTRIES.map(entry => (
              <SidebarEntry key={entry.label} className={clsx(entry.active && 'active')}>
                {entry.icon}
                {entry.label}
              </SidebarEntry>
            ))}
          </MockSidebar>

          <MockMain>
            <MockListHeader>
              <MockAvatar person={people.lea} size={28} />
              <MockListTitle>{leaListTitle}</MockListTitle>
              <MetaChip>🎂 Anniversaire de Léa</MetaChip>
            </MockListHeader>

            <BrowserCardsGrid>
              <CardSlot>
                <MockItemCard wish={leaWishes.headphones} view="guest" imageHeight={CARD_IMAGE_HEIGHT} />
                <SecretNote arrow="down" className="enter-note">
                  🤫 Léa ne voit pas ça
                </SecretNote>
              </CardSlot>
              <CameraReservation imageHeight={CARD_IMAGE_HEIGHT} previewInView={previewInView} />
              <MockItemCard
                wish={leaWishes.sneakers}
                view="guest"
                imageHeight={CARD_IMAGE_HEIGHT}
                className="wide-only"
              />
            </BrowserCardsGrid>
          </MockMain>
        </BrowserBody>
      </BrowserFrame>

      <DesktopPhone width={DESKTOP_PHONE_WIDTH} className="enter-rise delayed">
        <PhoneEventHeader
          emoji="🎂"
          title="Anniversaire de Léa"
          date={leaBirthdayDate()}
          attendees={[people.lea, people.camille, people.thomas, people.mamieJo]}
          attendeeCount={6}
          compact
        />
        <PhoneSectionLabel>Listes</PhoneSectionLabel>
        <PhoneWishlistCard>
          <MockAvatar person={people.lea} size={36} />
          <PhoneWishlistTitle>{leaListTitle}</PhoneWishlistTitle>
          <PhoneWishlistOwner>
            {people.lea.firstName} {people.lea.lastName}
          </PhoneWishlistOwner>
        </PhoneWishlistCard>
      </DesktopPhone>

      <PeekingGenie size={108} />
    </DesktopScene>
  );
};

/* -------------------------------- Mobile preview -------------------------------- */

const MobileScene = styled('div')({
  position: 'relative',
  width: 'min(300px, 86vw)',
  // Room for the genie sitting on the phone
  margin: '96px auto 0',
  ...sceneEntrance,
});

const MobilePhone = styled(PhoneFrame)({
  '& .phone-screen': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 12px 16px',
  },
});

const PhoneListTitle = styled('span')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '1.1rem',
  fontWeight: 600,
  lineHeight: 1.25,
  color: theme.palette.primary.main,
}));

const PhoneCountdownChip = styled(MetaChip)({
  marginTop: 6,
  // Room for the note above the first card
  marginBottom: 44,
});

/* Both cards share the row height of the tallest one, so the camera card can turn reserved
   (badge and longer footer) without resizing the phone and shifting the page. */
const PhoneCardStack = styled('div')({
  display: 'grid',
  gridAutoRows: '1fr',
  gap: 10,
  alignSelf: 'stretch',
  '&& .compact .item-image-container': {
    width: 64,
  },
  '& .MuiRating-root': {
    fontSize: '0.8rem',
  },
});

const MobilePreview = ({ previewInView }: PreviewProps) => {
  const [sceneRef, entered] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const countdown = getCountdown(leaBirthdayDate().toISO() ?? '');

  return (
    <MobileScene ref={sceneRef} className={clsx(entered && 'entered')}>
      <MobilePhone width="100%" className="enter-rise">
        <PhoneListTitle>{leaListTitle}</PhoneListTitle>
        <PhoneCountdownChip className={countdown.className}>🎂 {countdown.label}</PhoneCountdownChip>
        <PhoneCardStack>
          <CardSlot>
            <MockItemCard wish={leaWishes.headphones} view="guest" compact />
            <PhoneSecretNote arrow="down" className="enter-note">
              🤫 Léa ne voit pas ça
            </PhoneSecretNote>
          </CardSlot>
          <CameraReservation compact previewInView={previewInView} />
        </PhoneCardStack>
      </MobilePhone>

      <PeekingGenie size={88} onPhone />
    </MobileScene>
  );
};

/* ------------------------------------ Hero ------------------------------------ */

/** First screen of the landing: the promise, the sign-up, and Léa's list being reserved live. */
export const HeroSection = () => {
  const [visualRef, visualInView] = useInView<HTMLDivElement>({ threshold: 0, once: false });
  // Only the preview for the current layout is mounted (the app renders on the client only)
  const isMdUp = useMediaQuery(theme => theme.breakpoints.up('md'), { noSsr: true });

  return (
    <HeroRoot id="hero" aria-labelledby="hero-title">
      <HeroGrid maxWidth="lg">
        <HeroCopy>
          <OccasionsLine>
            🎂&nbsp;Anniversaire&nbsp;· 🎄&nbsp;Noël&nbsp;· 👶&nbsp;Naissance&nbsp;· 💍&nbsp;Mariage
          </OccasionsLine>
          <HeroTitle id="hero-title">
            La liste de souhaits qui <TitleHighlight>garde la surprise</TitleHighlight>.
          </HeroTitle>
          <HeroSubtitle>
            Créez votre liste et partagez-la avec les invités de votre événement&nbsp;: chacun réserve ce qu'il offre et
            voit ce qui est déjà pris. Vous, vous ne voyez rien jusqu'au jour&nbsp;J.
          </HeroSubtitle>

          <CtaRow>
            <PrimaryCtaLink to="/register" variant="contained" size="large" disableElevation>
              Créer ma liste gratuitement
            </PrimaryCtaLink>
            <SecondaryCta href="#comment-ca-marche" size="large" endIcon={<KeyboardArrowDownIcon />}>
              Voir comment ça marche
            </SecondaryCta>
          </CtaRow>

          <ReassuranceList>
            {REASSURANCES.map(label => (
              <li key={label}>
                <CheckCircleIcon />
                {label}
              </li>
            ))}
          </ReassuranceList>
        </HeroCopy>

        <HeroVisual ref={visualRef}>
          <VisuallyHidden>
            Aperçu : la liste de souhaits de Léa vue par ses proches. Le casque est réservé par Camille et Thomas, les
            baskets par Hugo. Léa, elle, ne voit pas ces réservations.
          </VisuallyHidden>
          {isMdUp ? <DesktopPreview previewInView={visualInView} /> : <MobilePreview previewInView={visualInView} />}
        </HeroVisual>
      </HeroGrid>
    </HeroRoot>
  );
};
