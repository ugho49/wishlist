import { alpha, styled, type Theme } from '@mui/material';

export const PageHero = styled('header')(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gridTemplateAreas: `
    "media title actions"
    "meta meta meta"
    "about about about"
  `,
  alignItems: 'center',
  columnGap: theme.spacing(1.5),
  rowGap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 20,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 60%, ${theme.palette.background.paper} 100%)`,

  '&::after': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  },

  [theme.breakpoints.up('md')]: {
    gridTemplateAreas: `
      "media title actions"
      "media meta actions"
      "about about about"
    `,
    columnGap: theme.spacing(2.5),
    rowGap: theme.spacing(1),
    padding: theme.spacing(3),
  },
}));

export const PageHeroMedia = styled('div')(({ theme }) => ({
  gridArea: 'media',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 4px 14px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
  '& > span, & > svg': {
    fontSize: '2rem',
  },
  '&.round': {
    borderRadius: '50%',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  [theme.breakpoints.up('md')]: {
    width: 76,
    height: 76,
    borderRadius: 20,
    alignSelf: 'center',
    '& > span, & > svg': {
      fontSize: '2.6rem',
    },
  },
}));

export const PageHeroTitle = styled('h1')(({ theme }) => ({
  gridArea: 'title',
  margin: 0,
  fontSize: '1.35rem',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: theme.palette.text.primary,
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    alignSelf: 'end',
    fontSize: '1.85rem',
  },
}));

export const PageHeroMeta = styled('div')(({ theme }) => ({
  gridArea: 'meta',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    alignSelf: 'start',
  },
}));

export const PageHeroActions = styled('div')(({ theme }) => ({
  gridArea: 'actions',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  alignSelf: 'start',
  [theme.breakpoints.up('md')]: {
    alignSelf: 'center',
  },
}));

export const PageHeroAbout = styled('div')(({ theme }) => ({
  gridArea: 'about',
  paddingTop: theme.spacing(1.5),
  marginTop: theme.spacing(0.5),
  borderTop: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.text.primary,
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
}));

const metaChipStyles = (theme: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 30,
  padding: theme.spacing(0.5, 1),
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: 'nowrap' as const,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0.5, 1.25),
    fontSize: '0.8125rem',
  },
  '& > .MuiSvgIcon-root': {
    fontSize: 16,
    color: theme.palette.primary.main,
  },
  '&.accent': {
    borderColor: 'transparent',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&.success': {
    borderColor: 'transparent',
    backgroundColor: alpha(theme.palette.success.main, 0.12),
    color: theme.palette.success.dark,
    fontWeight: 600,
    '& > .MuiSvgIcon-root': { color: theme.palette.success.main },
  },
});

export const MetaChip = styled('span')(({ theme }) => metaChipStyles(theme));

export const MetaChipButton = styled('button')(({ theme }) => ({
  fontFamily: 'inherit',
  ...metaChipStyles(theme),
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export const SectionHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  minHeight: 40,
  marginBottom: theme.spacing(1.5),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '1.05rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  '& .count': {
    minWidth: 24,
    height: 24,
    padding: '0 8px',
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}));
