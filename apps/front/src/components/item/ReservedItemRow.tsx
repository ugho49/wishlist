import type { ReservedItem } from './reserved-items-purchase';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Checkbox, Skeleton, styled } from '@mui/material';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { ReservedItemDetailsDialog } from './ReservedItemDetailsDialog';
import { isPurchased } from './reserved-items-purchase';

type PurchasedProps = { purchased?: boolean };

const forwardUnlessPurchased = { shouldForwardProp: (prop: PropertyKey) => prop !== 'purchased' };

const Row = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  listStyle: 'none',
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const RowButton = styled(
  'button',
  forwardUnlessPurchased,
)<PurchasedProps>(({ theme, purchased }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 1),
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  opacity: purchased ? 0.6 : 1,
  transition: 'opacity 180ms ease',
  '&:hover, &:focus-visible': {
    backgroundColor: theme.palette.action.hover,
    outline: 'none',
  },
}));

const Picture = styled('img')(({ theme }) => ({
  width: 56,
  height: 56,
  objectFit: 'cover',
  borderRadius: theme.spacing(1),
  flexShrink: 0,
  backgroundColor: theme.palette.grey[100],
}));

const PictureFallback = styled('span')(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.spacing(1),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
}));

const RowText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  gap: 2,
});

const ItemName = styled(
  'div',
  forwardUnlessPurchased,
)<PurchasedProps>(({ theme, purchased }) => ({
  color: purchased ? theme.palette.text.secondary : theme.palette.text.primary,
  textDecoration: purchased ? 'line-through' : 'none',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const ItemMeta = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const ExternalLink = styled('a')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  color: theme.palette.primary.main,
  '&:hover, &:focus-visible': {
    backgroundColor: theme.palette.action.hover,
    outline: 'none',
  },
}));

export type ReservedItemRowProps = {
  item: ReservedItem;
  onPurchasedChange: (purchased: boolean) => void;
};

const formatDay = (isoDate: string) => DateTime.fromISO(isoDate).toLocaleString(DateTime.DATE_MED);

export const ReservedItemRow = ({ item, onPurchasedChange }: ReservedItemRowProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const purchased = isPurchased(item);
  const status = item.purchasedAt
    ? `Acheté le ${formatDay(item.purchasedAt)}`
    : `Réservé le ${formatDay(item.takenAt)}`;
  const events = item.events.map(event => event.title).join(', ');

  return (
    <Row>
      <Checkbox
        checked={purchased}
        onChange={(_, checked) => onPurchasedChange(checked)}
        slotProps={{ input: { 'aria-label': `${item.name} acheté` } }}
      />
      <RowButton type="button" purchased={purchased} onClick={() => setDetailsOpen(true)}>
        {item.pictureUrl ? (
          <Picture src={item.pictureUrl} alt="" />
        ) : (
          <PictureFallback>
            <CardGiftcardIcon />
          </PictureFallback>
        )}
        <RowText>
          <ItemName purchased={purchased}>{item.name}</ItemName>
          <ItemMeta>
            Pour {item.ownerFirstName} {item.ownerLastName} · {item.wishlistTitle}
          </ItemMeta>
          <ItemMeta>
            {status}
            {events ? ` · ${events}` : ''}
          </ItemMeta>
        </RowText>
      </RowButton>
      {item.url && (
        <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${item.name}`}>
          <OpenInNewIcon fontSize="small" />
        </ExternalLink>
      )}
      <ReservedItemDetailsDialog
        item={detailsOpen ? item : undefined}
        onClose={() => setDetailsOpen(false)}
        onPurchasedChange={onPurchasedChange}
      />
    </Row>
  );
};

export const ReservedItemRowSkeleton = () => (
  <Row aria-hidden>
    <Skeleton variant="rounded" width={18} height={18} sx={{ margin: '12px' }} />
    <RowButton type="button" disabled>
      <Skeleton variant="rounded" width={56} height={56} />
      <RowText>
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </RowText>
    </RowButton>
  </Row>
);
