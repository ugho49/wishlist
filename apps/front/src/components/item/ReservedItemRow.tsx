import type { ReservedItemsListPageQuery } from '../../gql';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Skeleton, styled } from '@mui/material';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { ReservedItemDetailsDialog } from './ReservedItemDetailsDialog';

type ReservedItem = Extract<
  ReservedItemsListPageQuery['myReservedItems'],
  { __typename: 'GetReservedItemsPagedResponse' }
>['data'][number];

const Row = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  listStyle: 'none',
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const RowButton = styled('button')(({ theme }) => ({
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

const ItemName = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
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
};

export const ReservedItemRow = ({ item }: ReservedItemRowProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const reservedOn = DateTime.fromISO(item.takenAt).toLocaleString(DateTime.DATE_MED);
  const events = item.events.map(event => event.title).join(', ');

  return (
    <Row>
      <RowButton type="button" onClick={() => setDetailsOpen(true)}>
        {item.pictureUrl ? (
          <Picture src={item.pictureUrl} alt="" />
        ) : (
          <PictureFallback>
            <CardGiftcardIcon />
          </PictureFallback>
        )}
        <RowText>
          <ItemName>{item.name}</ItemName>
          <ItemMeta>
            Pour {item.ownerFirstName} {item.ownerLastName} · {item.wishlistTitle}
          </ItemMeta>
          <ItemMeta>
            Réservé le {reservedOn}
            {events ? ` · ${events}` : ''}
          </ItemMeta>
        </RowText>
      </RowButton>
      {item.url && (
        <ExternalLink href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${item.name}`}>
          <OpenInNewIcon fontSize="small" />
        </ExternalLink>
      )}
      <ReservedItemDetailsDialog item={detailsOpen ? item : undefined} onClose={() => setDetailsOpen(false)} />
    </Row>
  );
};

export const ReservedItemRowSkeleton = () => (
  <Row aria-hidden>
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
