import type { AttendeeId, EventId, UserId } from '@wishlist/common';
import type { EventDetail } from './event.types';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EuroIcon from '@mui/icons-material/Euro';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PeopleIcon from '@mui/icons-material/People';
import { Avatar, alpha, styled, useMediaQuery } from '@mui/material';
import { DateTime } from 'luxon';
import { useCallback, useRef, useState } from 'react';

import { SecretSantaStatus } from '../../gql';
import { useMySecretSantaDraw, useSecretSantaDrawReveal } from '../../hooks';
import { wholeEurosFormatter } from '../../utils/currency.utils';
import { Description } from '../common/Description';
import { SecretSantaBaubleScratch } from './SecretSantaBaubleScratch';

const EASTER_EGG_CLICKS = 4;
const EASTER_EGG_CLICK_MS = 450;

const GOLD = '#e8c547';
const CREAM = '#f6ecd0';

const Ticket = styled('section')(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 20,
  color: CREAM,
  userSelect: 'none',
  background: `
    radial-gradient(120% 140% at 100% 0%, ${alpha(GOLD, 0.22)} 0%, transparent 45%),
    linear-gradient(135deg, #1f5a3a 0%, #123526 60%, #0a2418 100%)
  `,
  boxShadow: `0 12px 28px -14px ${alpha('#0a2418', 0.7)}, inset 0 0 0 1px ${alpha(GOLD, 0.25)}`,

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundImage: `radial-gradient(${alpha('#ffffff', 0.22)} 1px, transparent 1.6px)`,
    backgroundSize: '22px 22px',
    maskImage: 'linear-gradient(to left, #000 0%, transparent 65%)',
    pointerEvents: 'none',
  },

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: theme.spacing(3),
    padding: theme.spacing(2.5, 3),
  },
}));

const GiftWatermark = styled(CardGiftcardIcon)({
  position: 'absolute',
  zIndex: -1,
  right: -18,
  bottom: -22,
  fontSize: 120,
  color: alpha(GOLD, 0.1),
  transform: 'rotate(-14deg)',
  pointerEvents: 'none',
});

const Recipient = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minWidth: 0,
}));

const RecipientAvatar = styled(Avatar)({
  width: 48,
  height: 48,
  flexShrink: 0,
  fontWeight: 700,
  color: '#3d1f14',
  backgroundColor: '#f3e0b0',
  boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 5px ${alpha(GOLD, 0.2)}`,
});

const Eyebrow = styled('div')({
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: GOLD,
});

const RecipientName = styled('div')(({ theme }) => ({
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontSize: '1.25rem',
  fontWeight: 700,
  lineHeight: 1.25,
  color: '#ffffff',
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.4rem',
  },
}));

const PendingText = styled('div')({
  fontSize: '0.85rem',
  color: alpha(CREAM, 0.8),
});

const Facts = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const Fact = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 30,
  padding: theme.spacing(0.5, 1),
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0.5, 1.25),
    fontSize: '0.8125rem',
  },
  whiteSpace: 'nowrap',
  color: CREAM,
  backgroundColor: alpha('#ffffff', 0.08),
  border: `1px solid ${alpha(GOLD, 0.3)}`,
  '& > .MuiSvgIcon-root': {
    fontSize: 16,
    color: GOLD,
  },
  '&.highlight': {
    color: '#3d1f14',
    backgroundColor: GOLD,
    borderColor: GOLD,
    '& > .MuiSvgIcon-root': { color: '#3d1f14' },
  },
}));

const Rules = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  borderTop: `1px dashed ${alpha(GOLD, 0.35)}`,
  color: alpha(CREAM, 0.9),
  '& a': { color: GOLD },
  '& blockquote': { borderLeftColor: GOLD, color: 'inherit' },
  [theme.breakpoints.up('md')]: {
    gridColumn: '1 / -1',
  },
}));

const RulesLabel = styled('div')({
  marginBottom: 4,
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: GOLD,
});

type MySecretSantaDrawProps = {
  eventId: EventId;
  eventTitle: string;
  eventDate: string;
  secretSanta?: EventDetail['secretSanta'];
  currentAttendeeId?: AttendeeId;
  currentUserId?: UserId;
};

export const MySecretSantaDraw = ({
  eventId,
  eventTitle,
  eventDate,
  secretSanta,
  currentAttendeeId,
  currentUserId,
}: MySecretSantaDrawProps) => {
  const { mySecretSantaDraw: draw } = useMySecretSantaDraw(eventId);
  const { isRevealed, markRevealed } = useSecretSantaDrawReveal(eventId, currentUserId);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [replayScratch, setReplayScratch] = useState(false);
  const clickStreakRef = useRef({ count: 0, lastAt: 0 });

  const handleTicketClick = useCallback(() => {
    const now = Date.now();
    const { count, lastAt } = clickStreakRef.current;
    const nextCount = now - lastAt > EASTER_EGG_CLICK_MS ? 1 : count + 1;
    clickStreakRef.current = { count: nextCount, lastAt: now };
    if (nextCount >= EASTER_EGG_CLICKS) {
      clickStreakRef.current = { count: 0, lastAt: 0 };
      setReplayScratch(true);
    }
  }, []);

  const isPendingParticipant =
    !draw &&
    secretSanta?.status === SecretSantaStatus.Created &&
    secretSanta.users.some(user => user.attendeeId === currentAttendeeId);

  if (!draw && !isPendingParticipant) {
    return;
  }

  const facts = secretSanta && (
    <Facts>
      {secretSanta.budget ? (
        <Fact className="highlight">
          <EuroIcon />
          Budget max {wholeEurosFormatter.format(secretSanta.budget)}
        </Fact>
      ) : (
        <Fact>
          <EuroIcon />
          Budget libre
        </Fact>
      )}
      <Fact>
        <PeopleIcon />
        {secretSanta.users.length} participants
      </Fact>
    </Facts>
  );

  const rules = secretSanta?.description && (
    <Rules>
      <RulesLabel>Le mot de l'organisateur</RulesLabel>
      <Description text={secretSanta.description} variant="plain" collapsedHeight={64} />
    </Rules>
  );

  if (!draw) {
    return (
      <Ticket aria-label="Secret Santa">
        <GiftWatermark aria-hidden />
        <Recipient>
          <RecipientAvatar>
            <HourglassTopIcon />
          </RecipientAvatar>
          <div>
            <Eyebrow>Secret Santa</Eyebrow>
            <RecipientName>Tirage en préparation</RecipientName>
            <PendingText>Tu participes ! Tu découvriras ici à qui offrir ton cadeau.</PendingText>
          </div>
        </Recipient>
        {facts}
        {rules}
      </Ticket>
    );
  }

  const displayName = draw.pendingEmail ? draw.pendingEmail : `${draw.user?.firstName} ${draw.user?.lastName}`;
  const pictureUrl = draw.user?.pictureUrl ?? undefined;
  const initials = draw.user ? `${draw.user.firstName[0] ?? ''}${draw.user.lastName[0] ?? ''}`.toUpperCase() : '?';
  const eventIsPast = DateTime.fromISO(eventDate).startOf('day') < DateTime.now().startOf('day');
  const firstVisitScratch = Boolean(currentUserId) && !isRevealed && !prefersReducedMotion && !eventIsPast;

  if (firstVisitScratch) {
    return (
      <SecretSantaBaubleScratch
        displayName={displayName}
        eventTitle={eventTitle}
        pictureUrl={pictureUrl}
        onRevealed={markRevealed}
      />
    );
  }

  return (
    <>
      {replayScratch && (
        <SecretSantaBaubleScratch
          displayName={displayName}
          eventTitle={eventTitle}
          pictureUrl={pictureUrl}
          onRevealed={() => setReplayScratch(false)}
        />
      )}
      <Ticket aria-label="Mon Secret Santa" onClick={handleTicketClick}>
        <GiftWatermark aria-hidden />
        <Recipient>
          <RecipientAvatar src={pictureUrl} alt="">
            {initials}
          </RecipientAvatar>
          <div>
            <Eyebrow>Secret Santa · tu offres à</Eyebrow>
            <RecipientName>{displayName}</RecipientName>
          </div>
        </Recipient>
        {facts}
        {rules}
      </Ticket>
    </>
  );
};
