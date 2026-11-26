import type { UserId } from '@wishlist/common';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Stack, styled } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { match } from 'ts-pattern';

import {
  FriendSource,
  isRejection,
  rejectionMessage,
  rejectionPattern,
  useFriendsPageQuery,
  useHideFriendMutation,
  useUnhideFriendMutation,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Card } from '../common/Card';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { EmptyState } from '../common/EmptyState';
import { Subtitle } from '../common/Subtitle';
import { Title } from '../common/Title';
import { AddFriendForm } from './AddFriendForm';
import { FriendRow, FriendRowSkeleton, fullName } from './FriendRow';

const SKELETON_KEYS = ['s1', 's2', 's3', 's4'] as const;

/** Queries showing the circle: the friends page and the user picker suggestions / search. */
const CIRCLE_QUERY_KEYS = [['FriendsPage'], ['UserClosestFriends'], ['SearchUsersSelect']] as const;

const List = styled('ul')({
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

const HiddenAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&::before': {
    display: 'none',
  },
}));

const sharedEventsLabel = (count: number) => `${count} évènement${count > 1 ? 's' : ''} en commun`;

export const FriendsPage = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useFriendsPageQuery(undefined, { select: d => d.friends });

  const circle = data?.__typename === 'FriendsOutput' ? data : undefined;
  const queryRejection = data && isRejection(data) ? data : undefined;
  const friends = circle?.friends ?? [];
  const hidden = circle?.hidden ?? [];

  const refreshCircle = () =>
    Promise.all(CIRCLE_QUERY_KEYS.map(queryKey => queryClient.invalidateQueries({ queryKey: [...queryKey] })));

  const { mutateAsync: hideFriend, isPending: hiding } = useHideFriendMutation({
    onError: () => addToast({ message: 'Impossible de masquer cet ami', variant: 'error' }),
  });
  const { mutateAsync: unhideFriend, isPending: unhiding } = useUnhideFriendMutation({
    onError: () => addToast({ message: 'Impossible de réafficher cet ami', variant: 'error' }),
  });

  const hide = async (userId: UserId, name: string) => {
    const res = await hideFriend({ userId });
    match(res.hideFriend)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: `${name} est masqué`, variant: 'info' });
        void refreshCircle();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const unhide = async (userId: UserId, name: string) => {
    const res = await unhideFriend({ userId });
    match(res.unhideFriend)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: `${name} est de retour dans vos amis`, variant: 'success' });
        void refreshCircle();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Box>
      <Title>Amis</Title>

      <Stack sx={{ gap: 3 }}>
        <Card>
          <Subtitle>Ajouter un ami</Subtitle>
          <AddFriendForm onAdded={() => void refreshCircle()} />
        </Card>

        {queryRejection && <Alert severity="error">{rejectionMessage(queryRejection)}</Alert>}

        <Card>
          <Subtitle>Vos amis{circle ? ` (${friends.length})` : ''}</Subtitle>

          {isLoading && (
            <List aria-busy>
              {SKELETON_KEYS.map(key => (
                <FriendRowSkeleton key={key} />
              ))}
            </List>
          )}

          {circle && friends.length === 0 && (
            <EmptyState
              genieVariant="hello"
              title="Pas encore d'amis"
              subtitle="Les personnes avec qui vous partagez un évènement apparaîtront ici. Vous pouvez aussi ajouter quelqu'un avec son email."
            />
          )}

          {friends.length > 0 && (
            <List>
              {friends.map(({ user, source, sharedEventsCount }) => (
                <FriendRow
                  key={user.id}
                  user={user}
                  meta={
                    <>
                      {source === FriendSource.Added && (
                        <Chip size="small" color="primary" variant="outlined" label="Ajouté" />
                      )}
                      {sharedEventsCount > 0 && <span>{sharedEventsLabel(sharedEventsCount)}</span>}
                    </>
                  }
                  action={
                    <ConfirmIconButton
                      confirmTitle={`Masquer ${fullName(user)} ?`}
                      confirmText={`${fullName(user)} n'apparaîtra plus dans vos amis ni dans les suggestions quand vous invitez des participants. Vous pourrez le réafficher quand vous voulez, et il n'est pas prévenu.`}
                      confirmButton="Masquer"
                      disabled={hiding}
                      onClick={() => void hide(user.id, fullName(user))}
                    >
                      <VisibilityOffIcon />
                    </ConfirmIconButton>
                  }
                />
              ))}
            </List>
          )}
        </Card>

        {hidden.length > 0 && (
          <HiddenAccordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Masqués ({hidden.length})</AccordionSummary>
            <AccordionDetails>
              <List>
                {hidden.map(user => (
                  <FriendRow
                    key={user.id}
                    user={user}
                    action={
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        disabled={unhiding}
                        onClick={() => void unhide(user.id, fullName(user))}
                      >
                        Réafficher
                      </Button>
                    }
                  />
                ))}
              </List>
            </AccordionDetails>
          </HiddenAccordion>
        )}
      </Stack>
    </Box>
  );
};
