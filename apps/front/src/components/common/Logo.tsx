import type { SxProps, Theme } from '@mui/material';

import { Box, styled } from '@mui/material';

import logoDark from '../../assets/logo/logo-dark.png';
import logoLight from '../../assets/logo/logo-light.png';
import wordmarkDark from '../../assets/logo/wordmark-dark.png';
import wordmarkLight from '../../assets/logo/wordmark-light.png';

const LOGO_ARTWORK = {
  dark: { full: logoDark, wordmark: wordmarkDark },
  light: { full: logoLight, wordmark: wordmarkLight },
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
    <LogoImage src={LOGO_ARTWORK[tone][variant]} alt="Wishlist" style={{ height }} />
  </Box>
);
