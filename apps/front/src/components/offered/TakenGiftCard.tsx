import type { WishlistId } from '@wishlist/common';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { Avatar, Chip, styled, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { DateTime } from 'luxon';

import { Card } from '../common/Card';

export type TakenGiftCardGift = {
  wishlistId: WishlistId;
  wishlistTitle: string;
  item: {
    name: string;
    description?: string | null;
    url?: string | null;
    price?: number | null;
    pictureUrl?: string | null;
  };
  recipient: {
    firstName: string;
    lastName: string;
    pictureUrl?: string | null;
  };
  events: Array<{
    title: string;
    icon?: string | null;
    eventDate: string;
  }>;
};

export type TakenGiftCardProps = {
  gift: TakenGiftCardGift;
};

const GiftCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  minHeight: '6.5rem',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&.past': {
    backgroundColor: theme.palette.grey[50],
    '& .gift-name': {
      color: theme.palette.text.secondary,
    },
  },
}));

const Picture = styled('img')({
  width: 88,
  height: 88,
  objectFit: 'cover',
  borderRadius: 12,
  flexShrink: 0,
});

const PictureFallback = styled('div')(({ theme }) => ({
  width: 88,
  height: 88,
  borderRadius: 12,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}25 100%)`,
  color: theme.palette.primary.main,
}));

const Content = styled('div')({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const GiftName = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const RecipientRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  fontWeight: 500,
  overflow: 'hidden',
}));

const EventLine = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const Price = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const StatusChip = styled(Chip)({
  flexShrink: 0,
  fontWeight: 600,
});

function latestEvent(events: TakenGiftCardGift['events']) {
  return [...events].sort(
    (a, b) => DateTime.fromISO(b.eventDate).toMillis() - DateTime.fromISO(a.eventDate).toMillis(),
  )[0];
}

function isPastGift(events: TakenGiftCardGift['events']): boolean {
  if (events.length === 0) return false;
  return events.every(event => DateTime.fromISO(event.eventDate) < DateTime.now().minus({ days: 1 }));
}

export const TakenGiftCard = ({ gift }: TakenGiftCardProps) => {
  const navigate = useNavigate();
  const past = isPastGift(gift.events);
  const event = latestEvent(gift.events);
  const recipientName = `${gift.recipient.firstName} ${gift.recipient.lastName}`;

  return (
    <GiftCardContent
      hoverable
      className={clsx(past && 'past', 'animated fadeIn fast')}
      onClick={() => navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: gift.wishlistId } })}
    >
      {gift.item.pictureUrl ? (
        <Picture src={gift.item.pictureUrl} alt="" />
      ) : (
        <PictureFallback>
          <CardGiftcardIcon />
        </PictureFallback>
      )}

      <Content>
        <GiftName className="gift-name">{gift.item.name}</GiftName>
        <RecipientRow>
          <Avatar src={gift.recipient.pictureUrl ?? undefined} sx={{ width: 22, height: 22, fontSize: '0.7rem' }}>
            {gift.recipient.firstName.charAt(0)}
          </Avatar>
          {past ? 'Offert à' : 'Pour'} {recipientName}
        </RecipientRow>
        <EventLine>
          {event
            ? `${event.icon ? `${event.icon} ` : ''}${event.title} · ${DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATE_MED)}`
            : gift.wishlistTitle}
        </EventLine>
        {gift.item.price != null && (
          <Price>
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(gift.item.price)}
          </Price>
        )}
      </Content>

      <StatusChip
        size="small"
        label={past ? 'Offert' : 'À offrir'}
        color={past ? 'default' : 'primary'}
        variant={past ? 'outlined' : 'filled'}
      />
    </GiftCardContent>
  );
};
