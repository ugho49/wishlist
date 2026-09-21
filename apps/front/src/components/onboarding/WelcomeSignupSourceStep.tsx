import GroupsIcon from '@mui/icons-material/Groups';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import ShareIcon from '@mui/icons-material/Share';
import { Stack, styled, TextField } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ChangeEvent,
  type MouseEvent,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { match } from 'ts-pattern';

import {
  rejectionMessage,
  rejectionPattern,
  SignupSource,
  useSetSignupSourceMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { CharsRemaining } from '../common/CharsRemaining';

const sourceChoices = [
  { value: SignupSource.Google, label: 'Google', icon: <SearchIcon /> },
  { value: SignupSource.Friends, label: 'Amis ou proches', icon: <GroupsIcon /> },
  { value: SignupSource.Social, label: 'Réseaux sociaux', icon: <ShareIcon /> },
  { value: SignupSource.Other, label: 'Autre', icon: <MoreHorizIcon /> },
];

const ChoiceGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1.5),
}));

const Choice = styled('button', { shouldForwardProp: prop => prop !== 'selected' })<{ selected: boolean }>(
  ({ theme, selected }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.grey[200]}`,
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.08) : theme.palette.grey[50],
    color: selected ? theme.palette.primary.main : theme.palette.text.primary,
    font: 'inherit',
    fontWeight: 600,
    fontSize: '0.95rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color 160ms ease, background-color 160ms ease, transform 160ms ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      cursor: 'default',
      transform: 'none',
    },
  }),
);

export type WelcomeSignupSourceStepHandle = {
  save: () => Promise<boolean>;
};

type WelcomeSignupSourceStepProps = {
  ref: Ref<WelcomeSignupSourceStepHandle>;
  disabled?: boolean;
};

export const WelcomeSignupSourceStep = ({ ref, disabled = false }: WelcomeSignupSourceStepProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useUserProfileCurrentUserQuery(undefined, {
    select: query => query.currentUser,
  });
  const user = data?.__typename === 'User' ? data : undefined;
  const [source, setSource] = useState<SignupSource | null>(null);
  const [detail, setDetail] = useState('');
  const [detailError, setDetailError] = useState<string>();
  const [initialized, setInitialized] = useState(false);

  const { mutateAsync: setSignupSource } = useSetSignupSourceMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  useEffect(() => {
    if (!user || initialized) {
      return;
    }

    setSource(user.signupSource ?? null);
    setDetail(user.signupSourceDetail ?? '');
    setInitialized(true);
  }, [initialized, user]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!source) {
      return true;
    }

    const trimmedDetail = detail.trim();
    if (source === SignupSource.Other && trimmedDetail.length === 0) {
      setDetailError('Indiquez comment vous nous avez connus');
      return false;
    }

    if (source === SignupSource.Other && trimmedDetail.length > 200) {
      setDetailError('200 caractères maximum');
      return false;
    }

    setDetailError(undefined);

    const sourceResult = await setSignupSource({
      input: {
        source,
        detail: source === SignupSource.Other ? trimmedDetail : undefined,
      },
    });

    return match(sourceResult.setSignupSource)
      .with({ __typename: 'User' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] });
        return true;
      })
      .with(rejectionPattern, rejection => {
        addToast({ message: rejectionMessage(rejection), variant: 'error' });
        return false;
      })
      .exhaustive();
  }, [addToast, detail, queryClient, setSignupSource, source]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  const handleSourceChange = (event: MouseEvent<HTMLButtonElement>) => {
    setSource(event.currentTarget.dataset.source as SignupSource);
    setDetailError(undefined);
  };

  const handleDetailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDetail(event.target.value);
    setDetailError(undefined);
  };

  return (
    <Stack spacing={2}>
      <ChoiceGrid>
        {sourceChoices.map(choice => (
          <Choice
            key={choice.value}
            type="button"
            selected={source === choice.value}
            data-source={choice.value}
            disabled={disabled}
            onClick={handleSourceChange}
          >
            {choice.icon}
            {choice.label}
          </Choice>
        ))}
      </ChoiceGrid>

      {source === SignupSource.Other && (
        <TextField
          label="Précisez"
          value={detail}
          disabled={disabled}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 200 } }}
          error={!!detailError}
          helperText={detailError ? detailError : <CharsRemaining max={200} value={detail} />}
          onChange={handleDetailChange}
        />
      )}
    </Stack>
  );
};
