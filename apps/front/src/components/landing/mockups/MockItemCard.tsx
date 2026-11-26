import type { MockPerson, MockWish } from './mock-data';

import RedeemIcon from '@mui/icons-material/Redeem';
import TipsAndUpdatesTwoToneIcon from '@mui/icons-material/TipsAndUpdatesTwoTone';
import { Avatar, keyframes, styled, Typography } from '@mui/material';
import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';

import { Rating } from '../../common/Rating';
import {
  ActionsContainer,
  ItemCardStyled,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemImageContainer,
  ItemTitle,
  RatingBubbleStyled,
  ReservedAvatarGroup,
  ReservedButton,
  ReservedIndicator,
  SuggestedBadge,
} from '../../item/item-card-parts';

// ReservedIndicator is centred with translateX(-50%), so the pop keeps that offset.
const indicatorPop = keyframes`
  from {
    transform: translateX(-50%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
`;

const tagPop = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const MockCard = styled(ItemCardStyled)({
  pointerEvents: 'none',
  transition: 'border-color 0.3s ease',
  // The real card blurs product photos once reserved; on emoji tiles that reads as a broken image.
  '&.reserved .item-image-container::before': {
    backdropFilter: 'none',
  },
  '& .mock-pop': {
    animation: `${indicatorPop} 420ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  },
  '& .mock-pop-inline': {
    animation: `${tagPop} 420ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  },
  // The emoji moves out of the way of the badge popping in, and back when it leaves
  '& .mock-glide': {
    transition: 'transform 300ms ease',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .mock-pop, & .mock-pop-inline': {
      animation: 'none',
    },
    '& .mock-glide': {
      transition: 'none',
    },
  },
  '&.compact': {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 96,
    '& .item-image-container': {
      width: 88,
      flexShrink: 0,
      height: 'auto',
    },
    '& .item-content': {
      padding: '10px 12px',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
  },
});

const EmojiTile = styled('span')({
  lineHeight: 1,
  userSelect: 'none',
});

const CompactTitle = styled('div')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '0.95rem',
  lineHeight: 1.25,
  color: theme.palette.primary.main,
}));

const CompactDetails = styled('div')(({ theme }) => ({
  fontSize: '0.75rem',
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
}));

const CompactFooter = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 6,
  flexWrap: 'wrap',
});

const SmallReserveButton = styled(ReservedButton)({
  minWidth: 0,
  height: 28,
  padding: '4px 10px',
  fontSize: '0.75rem',
});

const CompactReservedTag = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 10,
  fontSize: '0.7rem',
  fontWeight: 600,
  color: theme.palette.success.contrastText,
  background: `linear-gradient(167deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
  '& svg': { fontSize: '0.85rem' },
  // Keeps its room before the reservation, so the footer wraps the same way in both states
  '&.is-pending': {
    visibility: 'hidden',
  },
}));

/** Both labels share one grid cell, so the button keeps its width when "Réserver" turns into "Participer". */
const SwapLabelStyled = styled('span')({
  display: 'grid',
  justifyItems: 'center',
  '& > span': {
    gridArea: '1 / 1',
  },
  '& > .is-off': {
    visibility: 'hidden',
  },
});

/** Room kept between the emoji and the badges around it, in px. */
const EMOJI_GAP = 1;

type TopBadge = 'reserved' | 'suggested';

type EmojiFit = { shiftY: number; scale: number };

const topBadgeOf = (isTaken: boolean, showSuggested: boolean): TopBadge | null => {
  if (isTaken) return 'reserved';
  if (showSuggested) return 'suggested';
  return null;
};

/**
 * Fits the emoji in the free band between the top badge ("Réservé" or "Suggéré") and the hearts
 * bubble: centred in that band, and shrunk when the band is shorter than the emoji.
 * The band is measured rather than derived from imageHeight because each section resizes the
 * badges with its own CSS. Offsets ignore transforms, so the badge pop does not skew it.
 */
const useEmojiFit = (topBadge: TopBadge | null, hasHearts: boolean) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<EmojiFit | null>(null);

  useLayoutEffect(() => {
    const tile = tileRef.current;
    const emoji = emojiRef.current;
    const badge = badgeRef.current;
    const hearts = hasHearts ? heartsRef.current : null;
    if (topBadge === null || tile === null || emoji === null || badge === null) {
      setFit(null);
      return;
    }

    const measure = () => {
      // Hidden (display: none): the observer measures again once the tile shows up
      if (tile.clientHeight === 0) return;
      // The badge is positioned in the card, the emoji and the hearts in the tile
      const top = badge.offsetTop + badge.offsetHeight - tile.offsetTop + EMOJI_GAP;
      const bottom = (hearts ? hearts.offsetTop : tile.clientHeight) - EMOJI_GAP;
      const size = emoji.offsetHeight;
      const scale = Math.min(1, Math.max(bottom - top, 0) / size);
      const shiftY = Math.round((top + bottom - size) / 2 - emoji.offsetTop);
      setFit(previous => (previous?.shiftY === shiftY && previous.scale === scale ? previous : { shiftY, scale }));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tile);
    observer.observe(badge);
    if (hearts) observer.observe(hearts);
    return () => observer.disconnect();
  }, [topBadge, hasHearts]);

  return { tileRef, emojiRef, badgeRef, heartsRef, fit };
};

export type MockItemCardProps = {
  wish: MockWish;
  /** `owner`: what the list owner sees (no reservations, no suggestions). `guest`: what relatives see. */
  view: 'owner' | 'guest';
  /** Overrides `wish.takers`, e.g. while a reservation is being animated. */
  takers?: MockPerson[];
  /** Horizontal layout with a small thumbnail, for narrow phone mockups. */
  compact?: boolean;
  /** Height of the emoji tile in the vertical layout. */
  imageHeight?: number;
  /** Show the "Ajouté il y a…" footer of the real card. */
  showFooter?: boolean;
  /** Pop the "Réservé" badge in (when a reservation just happened). */
  popReserved?: boolean;
  className?: string;
};

const takerAvatars = (takers: MockPerson[]) =>
  takers.map(taker => <Avatar key={taker.firstName}>{taker.initial}</Avatar>);

/** A wish card built from the real ItemCard pieces, filled with fictional data. */
export const MockItemCard = ({
  wish,
  view,
  takers = wish.takers,
  compact = false,
  imageHeight = 120,
  showFooter = false,
  popReserved = false,
  className,
}: MockItemCardProps) => {
  const isGuest = view === 'guest';
  const isTaken = isGuest && takers.length > 0;
  const showSuggested = isGuest && wish.suggested === true && !isTaken;
  const reserveLabel = isTaken ? 'Participer' : 'Réserver';
  const { tileRef, emojiRef, badgeRef, heartsRef, fit } = useEmojiFit(
    compact ? null : topBadgeOf(isTaken, showSuggested),
    wish.hearts > 0,
  );

  if (compact) {
    return (
      <MockCard className={clsx('compact', isTaken && 'reserved', className)}>
        <ItemImageContainer className="item-image-container" style={{ background: wish.tint }}>
          <EmojiTile style={{ fontSize: 34 }}>{wish.emoji}</EmojiTile>
        </ItemImageContainer>
        <ItemContent className="item-content">
          <CompactTitle>{wish.name}</CompactTitle>
          <CompactDetails>{wish.details}</CompactDetails>
          <CompactFooter>
            {wish.hearts > 0 ? <Rating value={wish.hearts} size="small" readOnly /> : null}
            {isGuest ? (
              <>
                {/* While the reservation is animated, both states take the same room: the card
                    keeps its height when the tag shows up */}
                {isTaken || popReserved ? (
                  <CompactReservedTag
                    className={clsx(!isTaken && 'is-pending', isTaken && popReserved && 'mock-pop-inline')}
                  >
                    <RedeemIcon />
                    Réservé
                  </CompactReservedTag>
                ) : null}
                <SmallReserveButton tabIndex={-1} startIcon={<RedeemIcon />}>
                  {popReserved ? (
                    <SwapLabelStyled>
                      <span className={clsx(isTaken && 'is-off')}>Réserver</span>
                      <span className={clsx(!isTaken && 'is-off')}>Participer</span>
                    </SwapLabelStyled>
                  ) : (
                    reserveLabel
                  )}
                </SmallReserveButton>
              </>
            ) : null}
          </CompactFooter>
        </ItemContent>
      </MockCard>
    );
  }

  return (
    <MockCard className={clsx(isTaken && 'reserved', className)}>
      {showSuggested ? (
        <SuggestedBadge
          ref={badgeRef}
          icon={<TipsAndUpdatesTwoToneIcon />}
          label="Suggéré par un utilisateur"
          size="small"
        />
      ) : null}

      {isTaken ? (
        <ReservedIndicator ref={badgeRef} isReservedByMe={false} className={clsx(popReserved && 'mock-pop')}>
          <RedeemIcon sx={{ fontSize: '1rem' }} />
          <span>Réservé</span>
          <ReservedAvatarGroup max={3} spacing="small">
            {takerAvatars(takers)}
          </ReservedAvatarGroup>
        </ReservedIndicator>
      ) : null}

      <ItemImageContainer
        ref={tileRef}
        className="item-image-container"
        style={{ height: imageHeight, background: wish.tint }}
      >
        <EmojiTile
          ref={emojiRef}
          className={clsx(popReserved && 'mock-glide')}
          style={{
            fontSize: Math.round(imageHeight * 0.38),
            transform: fit ? `translateY(${fit.shiftY}px) scale(${fit.scale})` : undefined,
          }}
        >
          {wish.emoji}
        </EmojiTile>
        {wish.hearts > 0 ? (
          <RatingBubbleStyled ref={heartsRef}>
            <Rating value={wish.hearts} size="small" readOnly />
          </RatingBubbleStyled>
        ) : null}
      </ItemImageContainer>

      <ItemContent className="item-content">
        <ItemTitle>{wish.name}</ItemTitle>
        <ItemDescription>{wish.details}</ItemDescription>
        {isGuest ? (
          <ActionsContainer>
            <ReservedButton tabIndex={-1} startIcon={<RedeemIcon />}>
              {reserveLabel}
            </ReservedButton>
          </ActionsContainer>
        ) : null}
      </ItemContent>

      {showFooter ? (
        <ItemFooter style={{ justifyContent: 'center' }}>
          <Typography variant="caption">
            Ajouté il y a {wish.addedDaysAgo} {wish.addedDaysAgo > 1 ? 'jours' : 'jour'}
          </Typography>
        </ItemFooter>
      ) : null}
    </MockCard>
  );
};
