import type { SvgIconComponent } from '@mui/icons-material';
import type { MouseEvent } from 'react';
import type { MockWish } from './mockups/mock-data';

import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import RedeemIcon from '@mui/icons-material/Redeem';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  alpha,
  Button,
  Container,
  keyframes,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { brandColors } from '../../theme';
import { Genie } from '../common/Genie';
import { VisuallyHidden } from '../common/VisuallyHidden';
import { MockAvatar, PhoneFrame } from './mockups/frames';
import { MockItemCard } from './mockups/MockItemCard';
import { leaListTitle, leaWishes, people } from './mockups/mock-data';
import { prefersReducedMotion, useInView } from './useInView';

/* "Vous ne voyez rien. Eux voient tout." The same list seen by its owner and by her relatives:
   two phones side by side from md, one phone with a view toggle below. */

const SECTION_ID = 'surprise';
const TITLE_ID = 'surprise-title';

/** Screen height shared by every phone of the scene, so the whole phone stays around 500px. */
const PHONE_SCREEN_HEIGHT = 470;
const DESKTOP_PHONE_WIDTH = 250;
const MOBILE_PHONE_WIDTH = 'min(300px, 86vw)';
const CARD_IMAGE_HEIGHT = 56;
/** Léa's cards have no "Réserver" row: taller tiles and the "Ajouté il y a…" footer fill her screen like her relatives'. */
const OWNER_CARD_IMAGE_HEIGHT = 96;

/** Delay between two badges popping in the relatives' phone. */
const POP_STEP_MS = 80;
/** Without a tap on the toggle, the phone turns to the relatives' view once, this long after it shows up. */
const AUTO_SWITCH_DELAY_MS = 2500;

type SurpriseView = 'owner' | 'guest';

const OWNER_SUMMARY = `sa liste «\u00a0${leaListTitle}\u00a0» avec un casque audio, un appareil photo instantané, des baskets et un monstera, chacun noté en cœurs. Aucune réservation ni suggestion n'apparaît.`;
const GUEST_SUMMARY =
  "la même liste, sous le bandeau «\u00a0Plusieurs personnes peuvent réserver un cadeau\u00a0» et avec le bouton «\u00a0Suggérer un souhait\u00a0». Le casque est réservé par Camille et Thomas, les baskets par Hugo, avec un bouton «\u00a0Participer\u00a0»\u00a0; l'appareil photo et le monstera proposent «\u00a0Réserver\u00a0». Une cinquième idée, «\u00a0Atelier chocolat pour deux\u00a0», porte le badge «\u00a0Suggéré par un utilisateur\u00a0».";

const VIEWS: Record<SurpriseView, { emoji: string; pill: string; toggle: string; summary: string }> = {
  owner: { emoji: '👀', pill: 'Ce que voit Léa', toggle: 'Vue de Léa', summary: OWNER_SUMMARY },
  guest: { emoji: '🎁', pill: 'Ce que voient ses proches', toggle: 'Vue des proches', summary: GUEST_SUMMARY },
};

const SURPRISE_POINTS: { Icon: SvgIconComponent; text: string }[] = [
  { Icon: VisibilityOffIcon, text: 'Ni ce qui est réservé, ni par qui\u00a0: vous découvrez tout le jour\u00a0J.' },
  { Icon: RedeemIcon, text: 'Vos proches voient ce qui est déjà pris\u00a0: plus de doublons par erreur.' },
  { Icon: GroupsIcon, text: "Un gros cadeau\u00a0? Avec «\u00a0Participer\u00a0», on l'offre à plusieurs." },
  {
    Icon: TipsAndUpdatesIcon,
    text: 'Une idée pour vous\u00a0? Ils la proposent avec «\u00a0Suggérer un souhait\u00a0», sans que vous la voyiez.',
  },
];

const OWNER_WISHES: MockWish[] = [leaWishes.headphones, leaWishes.camera, leaWishes.sneakers, leaWishes.monstera];

/** Same cards, same order as the owner's phone, plus the suggestion only relatives see. */
const GUEST_CARDS: { wish: MockWish; className?: string }[] = [
  { wish: leaWishes.headphones },
  { wish: leaWishes.camera },
  { wish: leaWishes.sneakers, className: 'pop-step-1' },
  { wish: leaWishes.monstera },
  { wish: leaWishes.chocolate, className: 'wish-wide' },
];

const badgePop = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const SectionStyled = styled('section')(({ theme }) => ({
  scrollMarginTop: 80,
  overflowX: 'clip',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(8, 0),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(12, 0),
  },
}));

const SceneGridStyled = styled(Container)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(5),
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(7),
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '7fr 5fr',
    gap: theme.spacing(8),
  },
}));

const TextColumnStyled = styled('div')(({ theme }) => ({
  [theme.breakpoints.between('md', 'lg')]: {
    justifySelf: 'center',
    maxWidth: 760,
  },
}));

const SectionTitleStyled = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontSize: '2rem',
  lineHeight: 1.15,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
}));

const SubtitleStyled = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontSize: '1.125rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
}));

const PointListStyled = styled('ul')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  margin: 0,
  padding: 0,
  listStyle: 'none',
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: theme.spacing(4),
  },
  '& > li': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.75),
    fontSize: '1rem',
    lineHeight: 1.5,
    color: theme.palette.text.primary,
  },
}));

const PointIconStyled = styled('span')(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: '50%',
  color: theme.palette.primary.main,
  backgroundColor: brandColors.mistLight,
  '& > svg': {
    fontSize: 20,
  },
}));

const FootnoteStyled = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  fontSize: 13,
  lineHeight: 1.5,
  color: theme.palette.text.secondary,
}));

/* ---------- Phone screens ---------- */

const ScreenStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  height: '100%',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.common.white,
}));

const ScreenHeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ScreenTitleStyled = styled('span')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '0.95rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
}));

/** Stand-in for the app's add / suggest button: inert, like the rest of the mockup. */
const FakeActionButtonStyled = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-start',
  minWidth: 0,
  height: 26,
  padding: theme.spacing(0, 1.25),
  borderRadius: 8,
  fontSize: '0.68rem',
  fontWeight: 600,
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: 4,
  },
  '& .MuiButton-startIcon > svg': {
    fontSize: 14,
  },
}));

/** Same look as SharedReservationIntro, title only (no "Nouveau" badge, no paragraph). */
const SharedIntroBannerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.25),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
  fontSize: '0.7rem',
  fontWeight: 700,
  lineHeight: 1.3,
  color: theme.palette.text.primary,
}));

const SharedIntroIconStyled = styled('span')(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 26,
  height: 26,
  borderRadius: 7,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.16)}`,
  '& > svg': {
    fontSize: 15,
  },
}));

/** The real wish card pieces, shrunk so two cards fit side by side on a phone screen. */
const PhoneWishGridStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(1),
  '& > .wish-card': {
    borderRadius: 12,
  },
  '& > .wish-card.reserved': {
    borderWidth: 2,
  },
  '& > .wish-wide': {
    gridColumn: '1 / -1',
  },
  '& .wish-card .item-content': {
    gap: 0,
    padding: theme.spacing(0.75, 0.75, 1),
  },
  // Title
  '& .wish-card .item-content > div:first-of-type': {
    marginBottom: 0,
    fontSize: '0.72rem',
  },
  // Details stay out of such small cards
  '& .wish-card .item-content > p': {
    display: 'none',
  },
  // "Réserver" / "Participer"
  '& .wish-card .item-content > div:last-child': {
    paddingTop: theme.spacing(0.75),
  },
  '& .wish-card .MuiButton-root': {
    width: '100%',
    minWidth: 0,
    height: 24,
    padding: theme.spacing(0, 0.75),
    borderRadius: 8,
    fontSize: '0.66rem',
  },
  '& .wish-card .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: 3,
  },
  '& .wish-card .MuiButton-startIcon > svg': {
    fontSize: 13,
  },
  '& .wish-wide .MuiButton-root': {
    width: 'auto',
    padding: theme.spacing(0, 1.5),
  },
  // Hearts
  '& .wish-card .item-image-container .MuiStack-root': {
    right: 4,
    bottom: 4,
    padding: '1px 4px',
    borderRadius: 8,
  },
  '& .wish-card .MuiRating-root': {
    fontSize: '0.6rem',
  },
  // "Réservé" badge with the takers' avatars
  '& .wish-card.reserved > div:first-of-type': {
    top: 5,
    gap: 3,
    maxWidth: 'calc(100% - 8px)',
    padding: '2px 4px',
    borderRadius: 8,
    fontSize: '0.58rem',
    '& > svg': {
      fontSize: '0.72rem',
    },
  },
  '& .wish-card .MuiAvatarGroup-root .MuiAvatar-root': {
    width: 14,
    height: 14,
    marginLeft: -6,
    borderWidth: 1,
    fontSize: '0.45rem',
    '&:last-child': {
      marginLeft: 0,
    },
  },
  // "Suggéré par un utilisateur"
  '& .wish-card .MuiChip-root': {
    top: 6,
    right: 6,
    height: 20,
    fontSize: '0.6rem',
  },
  '& .wish-card .MuiChip-label': {
    paddingLeft: 5,
    paddingRight: 8,
  },
  '& .wish-card .MuiChip-icon': {
    marginLeft: 6,
    fontSize: '0.75rem',
  },
  // "Ajouté il y a…" footer (Léa's cards only)
  '& .wish-card > .item-content + div': {
    padding: theme.spacing(0.5, 0.75),
  },
  '& .wish-card > .item-content + div .MuiTypography-root': {
    minWidth: 0,
    overflow: 'hidden',
    fontSize: '0.58rem',
    lineHeight: 1.4,
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const GuestScreenStyled = styled(ScreenStyled)({
  // Badges pop one after the other; until then they wait in their first frame
  '& .wish-card .mock-pop': {
    animationFillMode: 'backwards',
  },
  '& .pop-step-1 .mock-pop': {
    animationDelay: `${POP_STEP_MS}ms`,
  },
  '&.is-revealed .wish-wide .MuiChip-root': {
    animation: `${badgePop} 420ms cubic-bezier(0.34, 1.56, 0.64, 1) ${POP_STEP_MS * 2}ms backwards`,
  },
  '&.is-paused .wish-card .mock-pop, &.is-paused .wish-card .MuiChip-root': {
    animationPlayState: 'paused',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&.is-revealed .wish-wide .MuiChip-root': {
      animation: 'none',
    },
  },
});

type ScreenProps = { className?: string };

/** What Léa sees on her own list: the wishes and their hearts, nothing else. */
const OwnerScreen = ({ className }: ScreenProps) => (
  <ScreenStyled className={className}>
    <ScreenHeaderStyled>
      <MockAvatar person={people.lea} size={26} />
      <ScreenTitleStyled>{leaListTitle}</ScreenTitleStyled>
    </ScreenHeaderStyled>
    <FakeActionButtonStyled variant="contained" size="small" startIcon={<AddIcon />} tabIndex={-1}>
      Ajouter un souhait
    </FakeActionButtonStyled>
    <PhoneWishGridStyled>
      {OWNER_WISHES.map(wish => (
        <MockItemCard
          key={wish.id}
          wish={wish}
          view="owner"
          imageHeight={OWNER_CARD_IMAGE_HEIGHT}
          showFooter
          className="wish-card"
        />
      ))}
    </PhoneWishGridStyled>
  </ScreenStyled>
);

type GuestScreenProps = ScreenProps & {
  /** Play the badges' pop (it replays each time this turns on). */
  revealed: boolean;
  /** Hold the pop on its first frame, e.g. until the phone scrolls into view. */
  paused?: boolean;
};

/** What Léa's relatives see on the same list: reservations, "Participer" and the hidden suggestion. */
const GuestScreen = ({ revealed, paused = false, className }: GuestScreenProps) => (
  <GuestScreenStyled className={clsx(revealed && 'is-revealed', paused && 'is-paused', className)}>
    <SharedIntroBannerStyled>
      <SharedIntroIconStyled>
        <RedeemIcon />
      </SharedIntroIconStyled>
      Plusieurs personnes peuvent réserver un cadeau
    </SharedIntroBannerStyled>
    <FakeActionButtonStyled variant="outlined" size="small" startIcon={<AddIcon />} tabIndex={-1}>
      Suggérer un souhait
    </FakeActionButtonStyled>
    <PhoneWishGridStyled>
      {GUEST_CARDS.map(({ wish, className: cardClassName }) => (
        <MockItemCard
          key={wish.id}
          wish={wish}
          view="guest"
          imageHeight={CARD_IMAGE_HEIGHT}
          popReserved={revealed}
          className={clsx('wish-card', cardClassName)}
        />
      ))}
    </PhoneWishGridStyled>
  </GuestScreenStyled>
);

/* ---------- md and up: both phones side by side ---------- */

const DuoStageStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  // Room for the genie hanging below the phones
  marginBottom: theme.spacing(3.5),
  [theme.breakpoints.up('md')]: {
    order: -1,
  },
}));

const PhoneFigureStyled = styled('figure')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1.75),
  minWidth: 0,
  margin: 0,
}));

const ViewPillStyled = styled('figcaption')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: theme.spacing(0.75, 1.75),
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  color: theme.palette.primary.main,
  backgroundColor: brandColors.mistLight,
  '&.guest': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
}));

const BetweenPhonesGenieStyled = styled(Genie)({
  position: 'absolute',
  left: '50%',
  bottom: -28,
  zIndex: 1,
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
});

const ViewPill = ({ view }: { view: SurpriseView }) => (
  <ViewPillStyled className={view}>
    <span aria-hidden>{VIEWS[view].emoji}</span>
    {VIEWS[view].pill}
    <VisuallyHidden>{`\u00a0: ${VIEWS[view].summary}`}</VisuallyHidden>
  </ViewPillStyled>
);

const DuoStage = () => {
  const [stageRef, stageInView] = useInView<HTMLDivElement>({ threshold: 0.35 });

  return (
    <DuoStageStyled ref={stageRef}>
      <PhoneFigureStyled>
        <ViewPill view="owner" />
        <PhoneFrame width={DESKTOP_PHONE_WIDTH} screenHeight={PHONE_SCREEN_HEIGHT}>
          <OwnerScreen />
        </PhoneFrame>
      </PhoneFigureStyled>
      <PhoneFigureStyled>
        <ViewPill view="guest" />
        <PhoneFrame width={DESKTOP_PHONE_WIDTH} screenHeight={PHONE_SCREEN_HEIGHT} fadeBottom>
          <GuestScreen revealed paused={!stageInView} />
        </PhoneFrame>
      </PhoneFigureStyled>
      <BetweenPhonesGenieStyled variant="shh" size={120} floating />
    </DuoStageStyled>
  );
};

/* ---------- Below md: one phone and a view toggle ---------- */

const SwitchStageStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2.5),
}));

const ToggleRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
  width: '100%',
  maxWidth: 420,
}));

const ToggleColumnStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  flex: 1,
  minWidth: 0,
}));

const ViewToggleButtonStyled = styled(ToggleButton)(({ theme }) => ({
  flex: '1 1 auto',
  height: 44,
  padding: theme.spacing(0, 1),
  fontSize: '0.875rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: theme.palette.primary.main,
  borderColor: brandColors.mist,
  '&.Mui-selected': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const ToggleHintStyled = styled('span')(({ theme }) => ({
  fontSize: 13,
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
  transition: 'opacity 200ms ease, visibility 0s linear 200ms',
  '&.is-hidden': {
    opacity: 0,
    visibility: 'hidden',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

/** Both screens stacked in the same phone, so switching views is a cross-fade. */
const CrossFadeStackStyled = styled('div')({
  display: 'grid',
  height: '100%',
  '& > .view-layer': {
    gridArea: '1 / 1',
    opacity: 0,
    transition: 'opacity 250ms ease',
  },
  '& > .view-layer.is-active': {
    opacity: 1,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& > .view-layer': {
      transition: 'none',
    },
  },
});

const SwitchStage = () => {
  const [view, setView] = useState<SurpriseView>('owner');
  const [touched, setTouched] = useState(false);
  const [autoSwitched, setAutoSwitched] = useState(false);
  // Not `once`: leaving the viewport before the delay cancels the automatic switch until the phone is back
  const [phoneRef, phoneInView] = useInView<HTMLElement>({ threshold: 0.6, once: false });

  // Show the other side once, by itself, to a visitor who has not tried the toggle yet
  useEffect(() => {
    if (!phoneInView || touched || autoSwitched || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => {
      setView('guest');
      setAutoSwitched(true);
    }, AUTO_SWITCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phoneInView, touched, autoSwitched]);

  const handleViewChange = (_event: MouseEvent<HTMLElement>, nextView: SurpriseView | null) => {
    setTouched(true);
    if (nextView) setView(nextView);
  };

  return (
    <SwitchStageStyled>
      <ToggleRowStyled>
        <ToggleColumnStyled>
          <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} aria-label="Point de vue">
            <ViewToggleButtonStyled value="owner">{VIEWS.owner.toggle}</ViewToggleButtonStyled>
            <ViewToggleButtonStyled value="guest">{VIEWS.guest.toggle}</ViewToggleButtonStyled>
          </ToggleButtonGroup>
          <ToggleHintStyled className={clsx(touched && 'is-hidden')}>
            Touchez pour changer de point de vue
          </ToggleHintStyled>
        </ToggleColumnStyled>
        <Genie variant="shh" size={80} floating />
      </ToggleRowStyled>

      <PhoneFigureStyled ref={phoneRef}>
        <PhoneFrame width={MOBILE_PHONE_WIDTH} screenHeight={PHONE_SCREEN_HEIGHT} fadeBottom>
          <CrossFadeStackStyled>
            <OwnerScreen className={clsx('view-layer', view === 'owner' && 'is-active')} />
            <GuestScreen revealed={view === 'guest'} className={clsx('view-layer', view === 'guest' && 'is-active')} />
          </CrossFadeStackStyled>
        </PhoneFrame>
        <VisuallyHidden as="figcaption">{`${VIEWS[view].toggle}\u00a0: ${VIEWS[view].summary}`}</VisuallyHidden>
      </PhoneFigureStyled>
    </SwitchStageStyled>
  );
};

/** The signature scene: the same list seen by its owner, where nothing looks reserved, and by her relatives. */
export const SurpriseSection = () => {
  const isMdUp = useMediaQuery(theme => theme.breakpoints.up('md'), { noSsr: true });

  return (
    <SectionStyled id={SECTION_ID} aria-labelledby={TITLE_ID}>
      <SceneGridStyled maxWidth="lg">
        <TextColumnStyled>
          <SectionTitleStyled variant="h2" id={TITLE_ID}>
            Vous ne voyez rien. Eux voient tout.
          </SectionTitleStyled>
          <SubtitleStyled>
            Sur votre propre liste, les réservations et les suggestions vous restent cachées. Vos proches, eux, savent
            qui offre quoi et s'organisent entre eux.
          </SubtitleStyled>
          <PointListStyled>
            {SURPRISE_POINTS.map(({ Icon, text }) => (
              <li key={text}>
                <PointIconStyled>
                  <Icon />
                </PointIconStyled>
                {text}
              </li>
            ))}
          </PointListStyled>
          <FootnoteStyled>
            Même si vous supprimez un souhait déjà réservé, il reste visible pour ceux qui l'offrent.
          </FootnoteStyled>
        </TextColumnStyled>

        {isMdUp ? <DuoStage /> : <SwitchStage />}
      </SceneGridStyled>
    </SectionStyled>
  );
};
