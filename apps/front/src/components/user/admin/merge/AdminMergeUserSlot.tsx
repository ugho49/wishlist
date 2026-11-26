import type { UserId } from '@wishlist/common';
import type { AdminUserMergePickerQuery } from '../../../../gql';

import { Autocomplete, Avatar, Button, Chip, Skeleton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import { UserAuthorities, useAdminUserDetailQuery, useAdminUserMergePickerQuery } from '../../../../gql';

type PickerUser = Extract<AdminUserMergePickerQuery['adminUsers'], { __typename: 'AdminGetAllUsers' }>['data'][number];

const SlotRoot = styled('section', { shouldForwardProp: prop => prop !== 'tone' })<{ tone: 'keep' | 'drop' }>(
  ({ theme, tone }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${tone === 'keep' ? theme.palette.primary.light : theme.palette.error.light}`,
    backgroundColor: tone === 'keep' ? theme.palette.grey[50] : theme.palette.background.paper,
  }),
);

const SlotTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

const SlotHint = styled('p')(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing(-1),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const Identity = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minWidth: 0,
}));

const IdentityText = styled('div')({
  minWidth: 0,
  flex: 1,
});

const IdentityName = styled('p')(({ theme }) => ({
  margin: 0,
  fontWeight: 600,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const IdentityMeta = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const ChipsRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
}));

const OptionRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

type AdminMergeUserSlotProps = {
  title: string;
  hint: string;
  tone: 'keep' | 'drop';
  userId?: UserId;
  excludedUserId?: UserId;
  disabled?: boolean;
  onChange: (userId: UserId | undefined) => void;
};

export const AdminMergeUserSlot = ({
  title,
  hint,
  tone,
  userId,
  excludedUserId,
  disabled,
  onChange,
}: AdminMergeUserSlotProps) => (
  <SlotRoot tone={tone} aria-label={title}>
    <SlotTitle>{title}</SlotTitle>
    <SlotHint>{hint}</SlotHint>
    {userId ? (
      <SelectedUser userId={userId} disabled={disabled} onClear={() => onChange(undefined)} />
    ) : (
      <UserPicker excludedUserId={excludedUserId} disabled={disabled} onSelect={onChange} />
    )}
  </SlotRoot>
);

const SelectedUser = ({ userId, disabled, onClear }: { userId: UserId; disabled?: boolean; onClear: () => void }) => {
  const { data, isLoading } = useAdminUserDetailQuery({ userId }, { select: d => d.adminUser });
  const user = data?.__typename === 'UserFull' ? data : undefined;

  if (isLoading) {
    return <Skeleton variant="rounded" height={56} />;
  }

  if (!user) {
    return (
      <>
        <IdentityMeta>Utilisateur introuvable</IdentityMeta>
        <Button size="small" variant="outlined" onClick={onClear}>
          Choisir un autre compte
        </Button>
      </>
    );
  }

  const isAdmin =
    user.authorities.includes(UserAuthorities.RoleAdmin) || user.authorities.includes(UserAuthorities.RoleSuperadmin);

  return (
    <>
      <Identity>
        <Avatar src={user.pictureUrl ?? undefined}>{user.firstName.substring(0, 1).toUpperCase()}</Avatar>
        <IdentityText>
          <IdentityName>
            {user.firstName} {user.lastName}
          </IdentityName>
          <IdentityMeta>{user.email}</IdentityMeta>
          <IdentityMeta>Inscrit le {DateTime.fromISO(user.createdAt).toLocaleString(DateTime.DATE_MED)}</IdentityMeta>
        </IdentityText>
        <Button size="small" onClick={onClear} disabled={disabled}>
          Changer
        </Button>
      </Identity>
      <ChipsRow>
        <Chip
          size="small"
          color={user.isEnabled ? 'success' : 'default'}
          label={user.isEnabled ? 'Actif' : 'Désactivé'}
        />
        {isAdmin ? <Chip size="small" color="primary" label="Admin" /> : null}
      </ChipsRow>
    </>
  );
};

const UserPicker = ({
  excludedUserId,
  disabled,
  onSelect,
}: {
  excludedUserId?: UserId;
  disabled?: boolean;
  onSelect: (userId: UserId) => void;
}) => {
  const [inputValue, setInputValue] = useState('');
  const [criteria, setCriteria] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setCriteria(inputValue.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  const searchEnabled = criteria.length >= SEARCH_MIN_LENGTH;
  const { data, isFetching } = useAdminUserMergePickerQuery(
    { input: { criteria, limit: 10 } },
    { enabled: searchEnabled, select: d => d.adminUsers },
  );
  const options: PickerUser[] = searchEnabled && data?.__typename === 'AdminGetAllUsers' ? data.data : [];

  return (
    <Autocomplete<PickerUser>
      fullWidth
      size="small"
      disabled={disabled}
      options={options}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, user) => {
        if (user) onSelect(user.id);
      }}
      filterOptions={values => values}
      loading={isFetching}
      loadingText="Recherche..."
      noOptionsText={searchEnabled ? 'Aucun utilisateur' : 'Tapez au moins 2 caractères'}
      getOptionDisabled={user => user.id === excludedUserId}
      getOptionLabel={user => `${user.firstName} ${user.lastName} (${user.email})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={({ key, ...props }, user) => (
        <OptionRow key={key} {...props}>
          <Avatar src={user.pictureUrl ?? undefined} sx={{ width: 28, height: 28 }}>
            {user.firstName.substring(0, 1).toUpperCase()}
          </Avatar>
          <span>
            <b>
              {user.firstName} {user.lastName}
            </b>{' '}
            ({user.email})
          </span>
        </OptionRow>
      )}
      renderInput={params => <TextField {...params} label="Rechercher un utilisateur" placeholder="Nom ou email" />}
    />
  );
};
