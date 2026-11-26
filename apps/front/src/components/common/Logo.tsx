import type { SxProps, Theme } from '@mui/material';

import { Box, styled } from '@mui/material';

import logoDark from '../../assets/logo/logo-dark.webp';
import logoLight from '../../assets/logo/logo-light.webp';
import wordmarkDark from '../../assets/logo/wordmark-dark.webp';
import wordmarkLight from '../../assets/logo/wordmark-light.webp';

/** Artwork and natural size, so the browser reserves the room before loading. */
const LOGO_ARTWORK = {
  dark: {
    full: { src: logoDark, width: 709, height: 240 },
    wordmark: { src: wordmarkDark, width: 659, height: 200 },
  },
  light: {
    full: { src: logoLight, width: 716, height: 240 },
    wordmark: { src: wordmarkLight, width: 649, height: 200 },
  },
} as const;

const LogoImage = styled('img')({
  display: 'block',
  width: 'auto',
  maxWidth: '100%',
  objectFit: 'contain',
});

interface LogoProps {
  /** `full`: genie + lettering, `wordmark`: the "wishlist" lettering alone (navigation bars). */
  variant?: 'full' | 'wordmark';
  /** `dark`: white lettering for navy surfaces, `light`: navy lettering for white surfaces. */
  tone?: keyof typeof LOGO_ARTWORK;
  /** Height in pixels; the width follows the artwork. */
  height?: number;
  sx?: SxProps<Theme>;
}

export const Logo = ({ variant = 'full', tone = 'dark', height = 48, sx }: LogoProps) => (
  <Box sx={sx}>
    <LogoImage
      src={LOGO_ARTWORK[tone][variant].src}
      width={LOGO_ARTWORK[tone][variant].width}
      height={LOGO_ARTWORK[tone][variant].height}
      alt="Wishlist"
      style={{ height }}
    />
  </Box>
);
