import { Alert, Box, Grid, Tab, Tabs } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { isRejection, rejectionMessage, TakenItemsScope, useTakenItemsPageQuery } from '../../gql';
import { Pagination } from '../common/Pagination';
import { Title } from '../common/Title';
import { EmptyTakenItemsState } from './EmptyTakenItemsState';
import { TakenGiftCard } from './TakenGiftCard';
import { TakenGiftCardSkeleton } from './TakenGiftCardSkeleton';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

const EMPTY_COPY = {
  [TakenItemsScope.All]: {
    title: 'Aucun cadeau réservé',
    subtitle: 'Parcourez les listes de vos proches et réservez un souhait pour ne rien oublier.',
  },
  [TakenItemsScope.Upcoming]: {
    title: 'Rien à offrir pour le moment',
    subtitle: 'Les cadeaux que vous réservez pour les prochains événements apparaîtront ici.',
  },
  [TakenItemsScope.Past]: {
    title: 'Pas encore d’historique',
    subtitle:
      'Après un événement, retrouvez ici ce que vous avez déjà offert — pour éviter les doublons l’année suivante.',
  },
} as const;

export const TakenItemsPage = () => {
  const { page: currentPage, scope } = useSearch({ from: '/_authenticated/_with-layout/offered/' });
  const navigate = useNavigate();
  const { data, isLoading: loading } = useTakenItemsPageQuery(
    { filters: { page: currentPage, scope } },
    { select: d => d.myTakenItems },
  );
  const pagedGifts = data?.__typename === 'GetMyTakenItemsOutput' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;
  const gifts = pagedGifts?.data ?? [];
  const totalElements = pagedGifts?.pagination.totalElements ?? 0;
  const totalPages = pagedGifts?.pagination.totalPages;
  const emptyCopy = EMPTY_COPY[scope];

  return (
    <Box>
      <Title>Cadeaux offerts</Title>

      <Tabs
        value={scope}
        onChange={(_, nextScope: TakenItemsScope) =>
          navigate({ from: '/offered/', search: { page: 1, scope: nextScope } })
        }
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        <Tab value={TakenItemsScope.All} label="Tous" />
        <Tab value={TakenItemsScope.Upcoming} label="À offrir" />
        <Tab value={TakenItemsScope.Past} label="Déjà offerts" />
      </Tabs>

      {queryRejection ? <Alert severity="error">{rejectionMessage(queryRejection)}</Alert> : null}

      {loading ? (
        <Grid container spacing={2} aria-busy>
          {SKELETON_KEYS.map(key => (
            <Grid key={key} size={{ xs: 12, lg: 6 }}>
              <TakenGiftCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {gifts.map(gift => (
            <Grid key={gift.item.id} size={{ xs: 12, lg: 6 }}>
              <TakenGiftCard gift={gift} />
            </Grid>
          ))}
        </Grid>
      )}

      {totalElements > 0 && (
        <Pagination
          totalPage={totalPages}
          currentPage={currentPage}
          disabled={loading}
          hide={totalPages === 1}
          onChange={value => navigate({ from: '/offered/', search: prev => ({ ...prev, page: value }) })}
        />
      )}

      {totalElements === 0 && !loading && !queryRejection && (
        <EmptyTakenItemsState
          sx={{ marginTop: '60px' }}
          title={emptyCopy.title}
          subtitle={emptyCopy.subtitle}
          onBrowseEventsClick={() => navigate({ to: '/events' })}
        />
      )}
    </Box>
  );
};
