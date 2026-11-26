import type { SxProps, Theme } from '@mui/material';

import { alpha, keyframes, styled } from '@mui/material';

import genieCalendar from '../../assets/mascot/genie-calendar.webp';
import genieHello from '../../assets/mascot/genie-hello.webp';
import genieLost from '../../assets/mascot/genie-lost.webp';
import geniePeek from '../../assets/mascot/genie-peek.webp';
import genieSanta from '../../assets/mascot/genie-santa.webp';
import genieShh from '../../assets/mascot/genie-shh.webp';
import genieWishlist from '../../assets/mascot/genie-wishlist.webp';

/** The genie's poses, one per situation, with their natural size so the browser reserves the room before loading. */
const GENIE_ARTWORK = {
  hello: { src: genieHello, width: 604, height: 560 },
  calendar: { src: genieCalendar, width: 344, height: 377 },
  wishlist: { src: genieWishlist, width: 375, height: 385 },
  santa: { src: genieSanta, width: 357, height: 400 },
  lost: { src: genieLost, width: 349, height: 411 },
  shh: { src: genieShh, width: 361, height: 480 },
  /** Head and hands resting on an edge: the bottom of the artwork is cut flat to sit on a frame. */
  peek: { src: geniePeek, width: 440, height: 360 },
} as const;

export type GenieVariant = keyof typeof GENIE_ARTWORK;

const genieFloat = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-6%) rotate(1.5deg);
  }
`;

const groundBreath = keyframes`
  0%, 100% {
    transform: scaleX(1);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.75);
    opacity: 0.55;
  }
`;

const FLOAT_DURATION = '6s';

/** White sticker outline so the navy contours (topknot, "?") stay readable on navy backgrounds. */
const ON_DARK_OUTLINE = [
  'drop-shadow(2px 0 0 #fff)',
  'drop-shadow(-2px 0 0 #fff)',
  'drop-shadow(0 2px 0 #fff)',
  'drop-shadow(0 -2px 0 #fff)',
].join(' ');

export type GenieProps = {
  /** What the genie is up to, to match the situation. */
  variant?: GenieVariant;
  /** Height in pixels. */
  size?: number;
  /** Gentle float (disabled with prefers-reduced-motion). */
  floating?: boolean;
  /** Soft shadow under the genie, which shrinks while it floats up. */
  grounded?: boolean;
  /** White outline for navy backgrounds. */
  onDark?: boolean;
  /** Load the artwork right away (above the fold); otherwise the browser loads it when it gets close. */
  eager?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
};

type GenieRootProps = Required<Pick<GenieProps, 'size' | 'floating' | 'grounded' | 'onDark'>>;

// Styling props, plus the ones MUI's styled keeps off the DOM by default
const GENIE_ROOT_PROPS = new Set<PropertyKey>(['size', 'floating', 'grounded', 'onDark', 'sx', 'ownerState', 'theme']);

const GenieRoot = styled('div', { shouldForwardProp: prop => !GENIE_ROOT_PROPS.has(prop) })<GenieRootProps>(
  ({ theme, size, floating, grounded, onDark }) => ({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    '& > img': {
      display: 'block',
      height: size,
      width: 'auto',
      filter: onDark ? ON_DARK_OUTLINE : 'none',
      animation: floating ? `${genieFloat} ${FLOAT_DURATION} ease-in-out infinite` : 'none',
    },
    ...(grounded
      ? {
          '&::after': {
            content: '""',
            width: Math.round(size * 0.35),
            height: Math.max(6, Math.round(size * 0.045)),
            marginTop: Math.round(size * 0.03),
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.14),
            animation: floating ? `${groundBreath} ${FLOAT_DURATION} ease-in-out infinite` : 'none',
          },
        }
      : {}),
    '@media (prefers-reduced-motion: reduce)': {
      '& > img, &::after': {
        animation: 'none',
      },
    },
  }),
);

/** The genie mascot as a decorative illustration. */
export const Genie = ({
  variant = 'hello',
  size = 150,
  floating = false,
  grounded = false,
  onDark = false,
  eager = false,
  className,
  sx,
}: GenieProps) => (
  <GenieRoot size={size} floating={floating} grounded={grounded} onDark={onDark} className={className} sx={sx}>
    <img
      src={GENIE_ARTWORK[variant].src}
      width={GENIE_ARTWORK[variant].width}
      height={GENIE_ARTWORK[variant].height}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  </GenieRoot>
);
