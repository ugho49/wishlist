import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, styled } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';

import { isRejection, rejectionMessage, useSecretSantaListPageQuery } from '../../gql';
import { FabAutoGrow } from '../common/FabAutoGrow';
import { Pagination } from '../common/Pagination';
import { Title } from '../common/Title';
import { CreateSecretSantaFromEventDialog } from './CreateSecretSantaFromEventDialog';
import { EmptySecretSantasState } from './EmptySecretSantasState';
import { SecretSantaTimelineItem, SecretSantaTimelineSkeleton } from './SecretSantaTimelineItem';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const;

const Timeline = styled('ol')({
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const SecretSantaListPage = () => {
  const { page: currentPage } = useSearch({
    from: '/_authenticated/_with-layout/secret-santas/',
  });
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data, isLoading: loading } = useSecretSantaListPageQuery(
    { filters: { page: currentPage } },
    { select: d => d.mySecretSantas },
  );
  const pagedSecretSantas = data?.__typename === 'GetSecretSantasPagedResponse' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;

  const secretSantas = pagedSecretSantas?.data ?? [];
  const totalElements = pagedSecretSantas?.pagination.totalElements ?? 0;
  const totalPages = pagedSecretSantas?.pagination.totalPages;

  const openCreateDialog = () => setCreateDialogOpen(true);

  return (
    <Box>
      {(loading || totalElements > 0) && <Title>Secret Santa</Title>}

      {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

      {loading && (
        <Timeline aria-busy>
          {SKELETON_KEYS.map(key => (
            <SecretSantaTimelineSkeleton key={key} />
          ))}
        </Timeline>
      )}

      {!loading && secretSantas.length > 0 && (
        <Timeline>
          {secretSantas.map(secretSanta => (
            <SecretSantaTimelineItem key={secretSanta.id} secretSanta={secretSanta} />
          ))}
        </Timeline>
      )}

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={totalPages}
            currentPage={currentPage}
            disabled={loading}
            hide={totalPages === 1}
            onChange={value =>
              navigate({
                from: '/secret-santas/',
                search: prev => ({ ...prev, page: value }),
              })
            }
          />

          <FabAutoGrow label="Créer un secret santa" icon={<AddIcon />} color="primary" onClick={openCreateDialog} />
        </>
      )}

      {totalElements === 0 && !loading && !queryRejection && (
        <EmptySecretSantasState sx={{ marginTop: '100px' }} onCreateClick={openCreateDialog} />
      )}

      <CreateSecretSantaFromEventDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </Box>
  );
};
