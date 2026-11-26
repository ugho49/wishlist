import type { ButtonProps } from '@mui/material';
import type { LinkProps } from '@tanstack/react-router';
import type { ScratchBaubleHandle } from '../secret-santa/ScratchBauble';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EuroIcon from '@mui/icons-material/Euro';
import PeopleIcon from '@mui/icons-material/People';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import { alpha, Button, Container, styled, useMediaQuery } from '@mui/material';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { lazy, Suspense, useCallback, useState } from 'react';

import { brandColors } from '../../theme';
import { wholeEurosFormatter } from '../../utils/currency.utils';
import { Genie } from '../common/Genie';
import { VisuallyHidden } from '../common/VisuallyHidden';
import { people } from './mockups/mock-data';
import { useInView } from './useInView';

/* Secret Santa: the page's only dark block, a contained navy panel. Text and steps on the left,
   the app's real scratch bauble on the right as a live demo (loaded when the section gets close). */

const SECTION_ID = 'secret-santa';
const TITLE_ID = 'secret-santa-title';

/** Same light as the app's reveal screen. */
const PANEL_BACKGROUND = 'radial-gradient(120% 90% at 50% 0%, #2c6189 0%, #1d4360 55%, #173a56 100%)';

const DEMO_EVENT_TITLE = 'Noël en famille';
const DEMO_RECIPIENT = people.mamieJo;
/** Lower than the app (0.75) so the demo reveals sooner. */
const DEMO_THRESHOLD = 0.5;
const MOBILE_BAUBLE_SIZE = 220;
const DESKTOP_BAUBLE_SIZE = 240;

/* Below the bauble on md+: hint, then button. From lg, the settings card is placed from these heights
   so it overlaps the bottom-left of the bauble without covering the hint. */
const HINT_GAP = 24;
const HINT_HEIGHT = 28;
const BUTTON_GAP = 8;
const BUTTON_HEIGHT = 40;
const CARD_BELOW_BAUBLE = 16;
const CARD_BOTTOM = HINT_GAP + HINT_HEIGHT + BUTTON_GAP + BUTTON_HEIGHT - CARD_BELOW_BAUBLE;

const STEPS = [
  'Choisissez les participants parmi vos invités',
  'Fixez un budget et laissez un petit mot',
  'Ajoutez des exclusions : pas de tirage entre conjoints',
  "Lancez le tirage : chacun reçoit un email qui l'invite à découvrir son destinataire",
  "Dans l'app, on gratte sa boule de Noël… et on garde le secret",
];

const DEMO_BUDGET = wholeEurosFormatter.format(30);
const DEMO_PARTICIPANTS = 6;
const DEMO_EXCLUSION = `${people.lea.firstName} ✕ ${people.thomas.firstName}`;

const DEMO_SUMMARY =
  "Démonstration : la boule de Noël à gratter de l'app, qui cache le nom de la personne à qui vous offrez. Le bouton « Révéler d'un coup » la découvre sans gratter.";
const SETTINGS_SUMMARY = `Réglages du Secret Santa « ${DEMO_EVENT_TITLE} » : budget max ${DEMO_BUDGET}, ${DEMO_PARTICIPANTS} participants, exclusion entre ${people.lea.firstName} et ${people.thomas.firstName}.`;

const ScratchBaubleDemo = lazy(() =>
  import('../secret-santa/ScratchBauble').then(module => ({ default: module.ScratchBauble })),
);

/* The nav anchor aims at the panel rather than the section: the panel lands this far below the sticky
   nav (56px, then 64px from sm), whatever the section's top padding. */
const PANEL_BELOW_NAV = 16;
const panelScrollMargin = (navHeight: number, sectionPaddingTop: string) =>
  `calc(${navHeight + PANEL_BELOW_NAV}px - ${sectionPaddingTop})`;

/* Entrance: elements start slightly lower and transparent, and settle once the panel is in view. */
const APPEAR_FROM = { opacity: 0, transform: 'translateY(16px)' } as const;
const APPEAR_TO = { opacity: 1, transform: 'none' } as const;
const APPEAR_TRANSITION = 'opacity 0.6s ease, transform 0.6s ease';

const SectionStyled = styled('section')(({ theme }) => ({
  scrollMarginTop: panelScrollMargin(56, theme.spacing(8)),
  overflowX: 'clip',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(8, 0),
  [theme.breakpoints.up('sm')]: {
    scrollMarginTop: panelScrollMargin(64, theme.spacing(8)),
  },
  [theme.breakpoints.up('md')]: {
    scrollMarginTop: panelScrollMargin(64, theme.spacing(12)),
    padding: theme.spacing(12, 0),
  },
}));

/** Text, demo and CTA in a single column; from md, text and CTA on the left, centred next to the demo. */
const PanelStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: '"intro" "demo" "cta"',
  rowGap: theme.spacing(5),
  padding: theme.spacing(3),
  borderRadius: 20,
  color: theme.palette.common.white,
  background: PANEL_BACKGROUND,
  boxShadow: `0 40px 80px -40px ${alpha(brandColors.navy, 0.6)}`,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: '1fr auto auto 1fr',
    gridTemplateAreas: '". demo" "intro demo" "cta demo" ". demo"',
    columnGap: theme.spacing(7),
    rowGap: 0,
    padding: theme.spacing(7),
    borderRadius: 28,
  },
}));

const IntroStyled = styled('div')({
  gridArea: 'intro',
});

const EyebrowStyled = styled('p')(({ theme }) => ({
  margin: theme.spacing(0, 0, 1.5),
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.04em',
  color: brandColors.mist,
}));

const TitleStyled = styled('h2')(({ theme }) => ({
  margin: theme.spacing(0, 0, 2),
  fontFamily: theme.typography.h2.fontFamily,
  fontWeight: 600,
  fontSize: '1.875rem',
  lineHeight: 1.15,
  color: theme.palette.common.white,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
}));

const LeadStyled = styled('p')(({ theme }) => ({
  margin: theme.spacing(0, 0, 3),
  fontSize: '1.0625rem',
  lineHeight: 1.6,
  color: alpha(theme.palette.common.white, 0.85),
}));

const StepListStyled = styled('ul')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));

const StepStyled = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  fontSize: '0.975rem',
  lineHeight: 1.5,
  color: alpha(theme.palette.common.white, 0.92),
  ...APPEAR_FROM,
  transition: APPEAR_TRANSITION,
  '.in-view &': APPEAR_TO,
  '@media (prefers-reduced-motion: reduce)': {
    ...APPEAR_TO,
    transition: 'none',
  },
}));

const StepCheckStyled = styled('span')(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 22,
  height: 22,
  marginTop: 1,
  borderRadius: '50%',
  color: theme.palette.common.white,
  backgroundColor: alpha(theme.palette.common.white, 0.16),
  '& svg': {
    fontSize: 15,
  },
}));

const CtaAreaStyled = styled('div')(({ theme }) => ({
  gridArea: 'cta',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    marginTop: theme.spacing(3),
  },
}));

const NoteStyled = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 12,
  lineHeight: 1.5,
  color: alpha(theme.palette.common.white, 0.7),
}));

const CtaButtonStyled = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: brandColors.mistLight,
    boxShadow: `0 10px 24px -10px ${alpha(theme.palette.common.black, 0.45)}`,
  },
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.common.white}`,
    outlineOffset: 3,
  },
  [theme.breakpoints.up('md')]: {
    width: 'auto',
  },
}));

const DemoAreaStyled = styled('div')(({ theme }) => ({
  gridArea: 'demo',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 0,
  [theme.breakpoints.up('md')]: {
    alignSelf: 'center',
  },
}));

/** Own stacking context, so the bauble's layers stay under the settings card. */
const DemoStageStyled = styled('div')({
  isolation: 'isolate',
  maxWidth: '100%',
});

const DemoHintStyled = styled('p')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: HINT_HEIGHT,
  margin: theme.spacing(2.5, 0, 0),
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: 14,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  color: theme.palette.common.white,
  transition: 'opacity 0.3s ease',
  '&.is-hidden': {
    opacity: 0,
  },
  '& svg': {
    flexShrink: 0,
    width: 30,
    height: 24,
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: 15,
  },
  [theme.breakpoints.up('md')]: {
    marginTop: HINT_GAP,
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

const DemoButtonStyled = styled(Button)(({ theme }) => ({
  height: BUTTON_HEIGHT,
  marginTop: BUTTON_GAP,
  padding: theme.spacing(0, 2),
  borderRadius: 999,
  fontWeight: 600,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    color: alpha(theme.palette.common.white, 0.45),
  },
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.common.white}`,
    outlineOffset: 2,
  },
}));

/** Static block under the buttons up to md; tilted over the bottom-left of the bauble from lg, where
    the column is wide enough for it to stay clear of the revealed name. */
const SettingsCardStyled = styled('div')(({ theme }) => ({
  '--card-tilt': '0deg',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 210,
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 1.75),
  borderRadius: 14,
  fontSize: 13,
  lineHeight: 1.35,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 18px 40px -14px ${alpha(theme.palette.common.black, 0.55)}`,
  pointerEvents: 'none',
  opacity: 0,
  transform: 'translateY(16px) rotate(calc(var(--card-tilt) * 3))',
  transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
  '.in-view &': {
    opacity: 1,
    transform: 'rotate(var(--card-tilt))',
  },
  [theme.breakpoints.up('lg')]: {
    '--card-tilt': '-2deg',
    position: 'absolute',
    zIndex: 1,
    right: 'calc(50% + 72px)',
    bottom: CARD_BOTTOM,
    marginTop: 0,
  },
  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'rotate(var(--card-tilt))',
    transition: 'none',
  },
}));

const SettingsTitleStyled = styled('span')(({ theme }) => ({
  marginBottom: 2,
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: 14,
}));

const SettingsRowStyled = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 500,
  '& svg': {
    fontSize: 16,
    opacity: 0.7,
  },
});

/** Pokes out of the top-right corner on mobile, half out of the bottom-right corner from md. */
const PanelGenieStyled = styled(Genie)(({ theme }) => ({
  position: 'absolute',
  top: -54,
  right: 12,
  pointerEvents: 'none',
  [theme.breakpoints.up('md')]: {
    top: 'auto',
    right: -12,
    bottom: -70,
  },
}));

/* Static, half-scratched bauble shown until the live demo is loaded. Same layout and sizes as
   `ScratchBauble`, so nothing moves when it takes over. */

/** Scratch marks, as centres in % of the bauble. */
const SCRATCH_MARKS: [number, number][] = [
  [30, 46],
  [37, 51],
  [44, 54],
  [51, 55],
  [58, 53],
  [65, 49],
  [38, 66],
  [46, 69],
  [54, 69],
  [61, 66],
];

const SCRATCHED_LAYERS = SCRATCH_MARKS.map(
  ([x, y]) => `radial-gradient(circle calc(var(--bauble-size) * 0.11) at ${x}% ${y}%, #f3f7f4 94%, transparent 100%)`,
).join(', ');

const PlaceholderSceneStyled = styled('div')(({ theme }) => ({
  '--bauble-size': `${MOBILE_BAUBLE_SIZE}px`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    '--bauble-size': `${DESKTOP_BAUBLE_SIZE}px`,
    gap: theme.spacing(4),
  },
}));

const PlaceholderHeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  maxWidth: 520,
  padding: theme.spacing(0, 2),
}));

const PlaceholderEyebrowStyled = styled('span')(({ theme }) => ({
  maxWidth: '100%',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 999,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#c8e6c9',
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
}));

const PlaceholderTitleStyled = styled('span')(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
}));

const PlaceholderSubtitleStyled = styled('span')(({ theme }) => ({
  fontSize: '0.95rem',
  color: alpha(theme.palette.common.white, 0.7),
}));

/** String, cap and sphere, kept together like the real ornament. */
const PlaceholderOrnamentStyled = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

/** Cap, with the string above it and its hook ring. */
const PlaceholderCapStyled = styled('span')({
  position: 'relative',
  zIndex: 1,
  display: 'block',
  width: 'calc(0.22 * var(--bauble-size))',
  height: 'clamp(16px, 3.4dvh, 24px)',
  marginTop: 'clamp(20px, 5dvh, 40px)',
  marginBottom: -4,
  borderRadius: '6px 6px 3px 3px',
  background: 'linear-gradient(90deg, #b8c4cf 0%, #f5f8fa 45%, #9aa8b5 100%)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    width: 2,
    height: 'clamp(20px, 5dvh, 40px)',
    marginLeft: -1,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.55) 100%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -11,
    left: '50%',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: '50%',
    border: '2px solid #dfe6ec',
  },
});

const PlaceholderSphereStyled = styled('span')(({ theme }) => ({
  position: 'relative',
  display: 'block',
  width: 'var(--bauble-size)',
  height: 'var(--bauble-size)',
  borderRadius: '50%',
  background: [
    'radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 18%, transparent 36%)',
    SCRATCHED_LAYERS,
    'radial-gradient(circle farthest-corner at 35% 32%, #5fb865 0%, #2e7d32 40%, #1b5e20 80%, #0f3d14 100%)',
  ].join(', '),
  boxShadow: `0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 0 80px -10px ${alpha(theme.palette.success.main, 0.55)}`,
  // Progress ring track
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: -11,
    borderRadius: '50%',
    border: `4px solid ${alpha(theme.palette.common.white, 0.12)}`,
  },
}));

const BaublePlaceholder = () => (
  <PlaceholderSceneStyled>
    <PlaceholderHeaderStyled>
      <PlaceholderEyebrowStyled>Secret Santa · {DEMO_EVENT_TITLE}</PlaceholderEyebrowStyled>
      <PlaceholderTitleStyled>À qui vas-tu offrir ?</PlaceholderTitleStyled>
      <PlaceholderSubtitleStyled>Gratte la boule du bout du doigt pour le découvrir</PlaceholderSubtitleStyled>
    </PlaceholderHeaderStyled>
    <PlaceholderOrnamentStyled>
      <PlaceholderCapStyled />
      <PlaceholderSphereStyled />
    </PlaceholderOrnamentStyled>
  </PlaceholderSceneStyled>
);

const HintArrow = () => (
  <svg viewBox="0 0 30 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M27 21C16 21 7 15 6 4" />
    <path d="M1.5 8.5 6 3.5l4.5 4.5" strokeLinejoin="round" />
  </svg>
);

export const SecretSantaSection = () => {
  const [panelRef, panelInView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [demoRef, demoNear] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: '200px' });
  const isMdUp = useMediaQuery(theme => theme.breakpoints.up('md'), { noSsr: true });
  const [bauble, setBauble] = useState<ScratchBaubleHandle | null>(null);
  const [round, setRound] = useState(0);
  const [scratched, setScratched] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleScratchStart = useCallback(() => setScratched(true), []);
  const handleRevealed = useCallback(() => setRevealed(true), []);
  const handleReplay = () => {
    setRound(current => current + 1);
    setScratched(false);
    setRevealed(false);
  };

  const placeholder = <BaublePlaceholder />;

  return (
    <SectionStyled id={SECTION_ID} aria-labelledby={TITLE_ID}>
      <Container maxWidth="lg">
        <PanelStyled ref={panelRef} className={clsx(panelInView && 'in-view')}>
          <IntroStyled>
            <EyebrowStyled>🎄 Secret Santa</EyebrowStyled>
            <TitleStyled id={TITLE_ID}>Le Secret Santa, sans petits papiers dans un bonnet</TitleStyled>
            <LeadStyled>
              Depuis votre événement de Noël, lancez le tirage au sort en quelques clics. Wishlist s'occupe du reste, et
              chacun découvre en secret à qui il offre.
            </LeadStyled>
            <StepListStyled>
              {STEPS.map((step, index) => (
                <StepStyled key={step} style={{ transitionDelay: `${index * 80}ms` }}>
                  <StepCheckStyled>
                    <CheckRoundedIcon />
                  </StepCheckStyled>
                  {step}
                </StepStyled>
              ))}
            </StepListStyled>
          </IntroStyled>

          <DemoAreaStyled ref={demoRef}>
            <VisuallyHidden>{DEMO_SUMMARY}</VisuallyHidden>
            <DemoStageStyled aria-hidden>
              {demoNear ? (
                <Suspense fallback={placeholder}>
                  <ScratchBaubleDemo
                    key={round}
                    ref={setBauble}
                    titleAs="p"
                    displayName={DEMO_RECIPIENT.firstName}
                    initials={DEMO_RECIPIENT.initial}
                    eventTitle={DEMO_EVENT_TITLE}
                    size={isMdUp ? DESKTOP_BAUBLE_SIZE : MOBILE_BAUBLE_SIZE}
                    threshold={DEMO_THRESHOLD}
                    onRevealed={handleRevealed}
                    onScratchStart={handleScratchStart}
                  />
                </Suspense>
              ) : (
                placeholder
              )}
            </DemoStageStyled>
            <DemoHintStyled aria-hidden className={clsx((scratched || revealed) && 'is-hidden')}>
              <HintArrow />
              Essayez : grattez la boule !
            </DemoHintStyled>
            <DemoButtonStyled
              disabled={!bauble}
              startIcon={revealed ? <ReplayIcon /> : <AutoAwesomeRoundedIcon />}
              onClick={revealed ? handleReplay : () => bauble?.reveal()}
            >
              {revealed ? 'Rejouer' : "Révéler d'un coup"}
            </DemoButtonStyled>
            <VisuallyHidden aria-live="polite">
              {revealed ? `Vous offrez à ${DEMO_RECIPIENT.firstName}.` : ''}
            </VisuallyHidden>

            <SettingsCardStyled aria-hidden>
              <SettingsTitleStyled>🎄 {DEMO_EVENT_TITLE}</SettingsTitleStyled>
              <SettingsRowStyled>
                <EuroIcon />
                Budget max · {DEMO_BUDGET}
              </SettingsRowStyled>
              <SettingsRowStyled>
                <PeopleIcon />
                {DEMO_PARTICIPANTS} participants
              </SettingsRowStyled>
              <SettingsRowStyled>
                <PersonOffOutlinedIcon />
                Exclusion · {DEMO_EXCLUSION}
              </SettingsRowStyled>
            </SettingsCardStyled>
            <VisuallyHidden>{SETTINGS_SUMMARY}</VisuallyHidden>
          </DemoAreaStyled>

          <CtaAreaStyled>
            <NoteStyled>
              Sur un événement à venir, dès 2 participants. L'organisateur peut annuler et relancer le tirage.
            </NoteStyled>
            <CtaButtonStyled variant="contained" size="large" component={Link} to="/register">
              Organiser mon Secret Santa
            </CtaButtonStyled>
          </CtaAreaStyled>

          <PanelGenieStyled variant="santa" size={isMdUp ? 140 : 90} onDark floating />
        </PanelStyled>
      </Container>
    </SectionStyled>
  );
};
