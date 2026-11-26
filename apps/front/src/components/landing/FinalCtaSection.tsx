import type { ButtonProps } from '@mui/material';
import type { LinkProps } from '@tanstack/react-router';
import type { ElementType } from 'react';

import { alpha, Button, Container, keyframes, styled, Typography, useMediaQuery } from '@mui/material';
import { Link } from '@tanstack/react-router';

import { brandColors } from '../../theme';
import { Genie } from '../common/Genie';
import { leaWishes } from './mockups/mock-data';
import { useInView } from './useInView';

const OCCASIONS = [
  { emoji: '🎂', label: 'Anniversaire' },
  { emoji: '🎄', label: 'Noël' },
  { emoji: '👶', label: 'Naissance' },
  { emoji: '💍', label: 'Mariage' },
  { emoji: '🏡', label: 'Crémaillère' },
];

/** Wishes drifting on the panel edges (lg and up), placed around the content. */
const DRIFTING_WISHES = [
  { wish: leaWishes.headphones, position: { top: 56, left: -20 }, rotate: -8, delay: 0 },
  { wish: leaWishes.monstera, position: { top: -20, right: 88 }, rotate: 8, delay: -3 },
  { wish: leaWishes.camera, position: { bottom: 64, right: -20 }, rotate: -8, delay: -5.5 },
];

/** Sparkles around the genie: position in % of the genie stage, size in px. */
const SPARKLES = [
  { top: '4%', left: '-8%', size: 18 },
  { top: '-6%', right: '2%', size: 12 },
  { top: '48%', right: '-12%', size: 14 },
];

const ENTRANCE_DURATION = '400ms';
const CHIP_STAGGER_MS = 40;
const SPARKLE_STAGGER_MS = 120;

const wishDrift = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const SectionStyled = styled(Container)<{ component: ElementType }>(({ theme }) => ({
  scrollMarginTop: 80,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(12),
  },
}));

const PanelStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(5, 3),
  borderRadius: 28,
  backgroundColor: brandColors.mistLight,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(8, 6),
  },
}));

const WishTileStyled = styled('span')(({ theme }) => ({
  position: 'absolute',
  display: 'none',
  placeItems: 'center',
  width: 64,
  height: 64,
  borderRadius: 14,
  border: `2px solid ${theme.palette.common.white}`,
  fontSize: 30,
  lineHeight: 1,
  opacity: 0.8,
  boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
  animation: `${wishDrift} 8s ease-in-out infinite`,
  // From lg only: on md the panel spans nearly the whole viewport, so the tiles would be cut by its edges.
  [theme.breakpoints.up('lg')]: {
    display: 'grid',
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

/** Positioning context for the sparkles around the genie. */
const GenieStageStyled = styled('div')({
  position: 'relative',
  display: 'inline-flex',
});

const SparkleStyled = styled('svg', { shouldForwardProp: prop => prop !== 'visible' })<{ visible: boolean }>(
  ({ visible }) => ({
    position: 'absolute',
    color: brandColors.mist,
    '@media (prefers-reduced-motion: no-preference)': {
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.3)',
      transition: `opacity ${ENTRANCE_DURATION} ease-out, transform ${ENTRANCE_DURATION} cubic-bezier(0.34, 1.56, 0.64, 1)`,
    },
  }),
);

const TitleStyled = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(3, 0, 0),
  fontSize: '2rem',
  lineHeight: 1.15,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
}));

const SubtitleStyled = styled(Typography)(({ theme }) => ({
  maxWidth: 520,
  margin: theme.spacing(2, 0, 0),
  fontSize: 17,
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
}));

const OccasionListStyled = styled('ul', { shouldForwardProp: prop => prop !== 'visible' })<{ visible: boolean }>(
  ({ theme, visible }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(1, 1.25),
    margin: theme.spacing(3.5, 0, 0),
    padding: 0,
    listStyle: 'none',
    '& > li': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: theme.spacing(0.75, 1.75),
      borderRadius: 999,
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 6px 16px -8px ${alpha(theme.palette.primary.main, 0.3)}`,
      '@media (prefers-reduced-motion: no-preference)': {
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(8px)',
        transition: `opacity ${ENTRANCE_DURATION} ease-out, transform ${ENTRANCE_DURATION} ease-out`,
      },
    },
  }),
);

const CtaRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  width: '100%',
  marginTop: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 'auto',
  },
}));

const PrimaryCtaStyled = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5, 3.5),
    fontSize: 16,
  },
}));

const SecondaryCtaStyled = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    fontSize: 16,
  },
}));

const MentionStyled = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2.5, 0, 0),
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

/** Four-pointed sparkle, in the genie's mist blue. */
const Sparkle = ({
  sparkle: { size, ...position },
  visible,
  delayMs,
}: {
  sparkle: (typeof SPARKLES)[number];
  visible: boolean;
  delayMs: number;
}) => (
  <SparkleStyled
    visible={visible}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ ...position, transitionDelay: `${delayMs}ms` }}
    aria-hidden
  >
    <path
      fill="currentColor"
      d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z"
    />
  </SparkleStyled>
);

export const FinalCtaSection = () => {
  const [panelRef, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const isSmUp = useMediaQuery(theme => theme.breakpoints.up('sm'), { noSsr: true });

  return (
    <SectionStyled maxWidth="md" component="section" id="commencer" aria-labelledby="commencer-title">
      <PanelStyled ref={panelRef}>
        {DRIFTING_WISHES.map(({ wish, position, rotate, delay }) => (
          <WishTileStyled
            key={wish.id}
            style={{ ...position, rotate: `${rotate}deg`, backgroundColor: wish.tint, animationDelay: `${delay}s` }}
            aria-hidden
          >
            {wish.emoji}
          </WishTileStyled>
        ))}

        <GenieStageStyled aria-hidden>
          <Genie variant="wishlist" size={isSmUp ? 150 : 110} floating grounded />
          {SPARKLES.map((sparkle, index) => (
            <Sparkle
              key={`${sparkle.top}-${sparkle.size}`}
              sparkle={sparkle}
              visible={inView}
              delayMs={index * SPARKLE_STAGGER_MS}
            />
          ))}
        </GenieStageStyled>

        <TitleStyled variant="h2" id="commencer-title">
          Alors, on fait un vœu&nbsp;?
        </TitleStyled>
        <SubtitleStyled>
          Créez votre première liste en quelques minutes, invitez vos proches, et laissez le génie veiller sur la
          surprise.
        </SubtitleStyled>

        <OccasionListStyled visible={inView} aria-label="Pour toutes les occasions">
          {OCCASIONS.map(({ emoji, label }, index) => (
            <li key={label} style={{ transitionDelay: `${index * CHIP_STAGGER_MS}ms` }}>
              <span aria-hidden>{emoji}</span>
              {label}
            </li>
          ))}
        </OccasionListStyled>

        <CtaRowStyled>
          <PrimaryCtaStyled variant="contained" size="large" component={Link} to="/register">
            Créer ma liste gratuitement
          </PrimaryCtaStyled>
          <SecondaryCtaStyled variant="text" size="large" component={Link} to="/login">
            J'ai déjà un compte
          </SecondaryCtaStyled>
        </CtaRowStyled>

        <MentionStyled>Gratuit et sans publicité · Connexion avec Google</MentionStyled>
      </PanelStyled>
    </SectionStyled>
  );
};
