import type { EventId, UserId } from '@wishlist/common';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { Avatar, alpha, Box, Stack, styled, useMediaQuery } from '@mui/material';
import { DateTime } from 'luxon';
import { useCallback, useRef, useState } from 'react';

import { useMySecretSantaDraw, useSecretSantaDrawReveal } from '../../hooks';
import { SecretSantaBaubleScratch } from './SecretSantaBaubleScratch';

const EASTER_EGG_CLICKS = 4;
const EASTER_EGG_CLICK_MS = 450;

const Container = styled(Stack)(({ theme }) => ({
  padding: '12px',
  borderRadius: '12px',
  color: theme.palette.text.primary,
  backgroundColor: alpha('#2f7d31', 0.04),
  border: `1px solid ${alpha('#2f7d31', 0.12)}`,
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 400,
  textAlign: 'left',
  borderLeft: '8px solid #2f7d31',
  gap: '16px',
  userSelect: 'none',
}));

const IconWrapper = styled('div')({
  color: '#2f7d31',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  marginTop: '4px',
  flexShrink: 0,
});

const DrawName = styled('div')({
  fontWeight: 'bold',
  fontSize: '16px',
  color: '#2f7d31',
});

const InfoRow = styled(Stack)({
  flexDirection: 'row',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '4px',
});

const InfoText = styled(Box)({
  fontSize: '16px',
});

const StyledAvatar = styled(Avatar)({
  width: '28px',
  height: '28px',
  backgroundColor: '#2f7d31',
});

const DescriptionText = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}));

type MySecretSantaDrawProps = {
  eventId: EventId;
  eventTitle: string;
  eventDate: string;
  currentUserId?: UserId;
};

export const MySecretSantaDraw = ({ eventId, eventTitle, eventDate, currentUserId }: MySecretSantaDrawProps) => {
  const { mySecretSantaDraw: draw } = useMySecretSantaDraw(eventId);
  const { isRevealed, markRevealed } = useSecretSantaDrawReveal(eventId, currentUserId);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [replayScratch, setReplayScratch] = useState(false);
  const clickStreakRef = useRef({ count: 0, lastAt: 0 });

  const handleBannerClick = useCallback(() => {
    const now = Date.now();
    const { count, lastAt } = clickStreakRef.current;
    const nextCount = now - lastAt > EASTER_EGG_CLICK_MS ? 1 : count + 1;
    clickStreakRef.current = { count: nextCount, lastAt: now };
    if (nextCount >= EASTER_EGG_CLICKS) {
      clickStreakRef.current = { count: 0, lastAt: 0 };
      setReplayScratch(true);
    }
  }, []);

  if (!draw) {
    return;
  }

  const displayName = draw.pendingEmail ? draw.pendingEmail : `${draw.user?.firstName} ${draw.user?.lastName}`;
  const pictureUrl = draw.user?.pictureUrl ?? undefined;
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
      <Container direction="row" sx={{ alignItems: 'flex-start' }} onClick={handleBannerClick}>
        <IconWrapper>
          <CardGiftcardIcon fontSize="small" />
        </IconWrapper>
        <Stack direction="column" sx={{ flex: 1 }}>
          <InfoRow>
            <InfoText>Votre Secret Santa est :</InfoText>
            <StyledAvatar src={pictureUrl} />
            <DrawName>{displayName}</DrawName>
          </InfoRow>
          <DescriptionText>Vous devez offrir un cadeau à cette personne lors de l'événement !</DescriptionText>
        </Stack>
      </Container>
    </>
  );
};
