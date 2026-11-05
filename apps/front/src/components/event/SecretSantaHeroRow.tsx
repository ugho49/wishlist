import type { ReactNode } from 'react';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { alpha, Button, keyframes, styled } from '@mui/material';

import { PageHeroRow } from '../common/PageHero';

const wiggle = keyframes`
  0%, 82%, 100% { transform: rotate(0deg) scale(1); }
  86% { transform: rotate(-14deg) scale(1.1); }
  90% { transform: rotate(12deg) scale(1.1); }
  94% { transform: rotate(-6deg) scale(1.05); }
`;

export const SecretSantaRow = styled(PageHeroRow)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  marginTop: theme.spacing(0.5),
  borderTop: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
  userSelect: 'none',
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(2),
  },
}));

const Lead = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minWidth: 0,
  flex: '1 1 220px',
}));

const Visual = styled('div')(({ theme }) => ({
  position: 'relative',
  flexShrink: 0,
  width: 44,
  height: 44,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 4px 14px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
  '& > .MuiAvatar-root': {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    fontSize: '0.95rem',
    fontWeight: 700,
  },
  [theme.breakpoints.up('md')]: {
    width: 52,
    height: 52,
    borderRadius: 16,
    '& > .MuiAvatar-root': { borderRadius: 16 },
  },
}));

const GiftBadge = styled('span')(({ theme }) => ({
  position: 'absolute',
  right: -6,
  bottom: -6,
  width: 22,
  height: 22,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  border: `2px solid ${theme.palette.background.paper}`,
  animation: `${wiggle} 4s ease-in-out infinite`,
  '& > .MuiSvgIcon-root': { fontSize: 12 },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const Text = styled('div')({
  minWidth: 0,
});

const Eyebrow = styled('div')(({ theme }) => ({
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: theme.palette.primary.main,
}));

const Title = styled('div')(({ theme }) => ({
  fontSize: '1.05rem',
  fontWeight: 700,
  lineHeight: 1.3,
  color: theme.palette.text.primary,
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.25rem',
  },
}));

const Subtitle = styled('div')(({ theme }) => ({
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
}));

export const SecretSantaRowActions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&.cta': {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center',
    },
  },
}));

export const SecretSantaRowButton = styled(Button)(({ theme }) => ({
  height: 32,
  padding: theme.spacing(0, 2),
  borderRadius: 999,
  fontSize: '0.8125rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}));

type SecretSantaRowLeadProps = {
  visual: ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  withGiftBadge?: boolean;
};

export const SecretSantaRowLead = ({
  visual,
  eyebrow,
  title,
  subtitle,
  withGiftBadge = true,
}: SecretSantaRowLeadProps) => (
  <Lead>
    <Visual>
      {visual}
      {withGiftBadge && (
        <GiftBadge aria-hidden>
          <CardGiftcardIcon />
        </GiftBadge>
      )}
    </Visual>
    <Text>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Text>
  </Lead>
);
