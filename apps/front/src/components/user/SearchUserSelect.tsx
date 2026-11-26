import type { SearchUsersSelectQuery } from '../../gql';

import PersonIcon from '@mui/icons-material/Person';
import { Autocomplete, Avatar, Stack, TextField } from '@mui/material';
import { blue, grey, orange } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isValidEmail } from '@wishlist/common';
import { uniqBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import {
  BusinessRuleCode,
  useSearchUsersSelectQuery,
  useUserByEmailQuery,
  useUserClosestFriendsQuery,
} from '../../gql';

type MiniUser = Extract<SearchUsersSelectQuery['searchUsers'], { __typename: 'SearchUsersOutput' }>['users'][number];

/** `circle`: people the user already attends an event with; `email`: account found by its exact email. */
type UserOptionType = MiniUser & { group: 'circle' | 'email' };

export type OptionType = UserOptionType | string;

const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;
const CLOSEST_FRIENDS_LIMIT = 20;

const GROUP_LABELS: Record<UserOptionType['group'] | 'invite', string> = {
  circle: 'Amis récurrents',
  email: 'Compte trouvé par email',
  invite: 'Invitation par email',
};

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '8px 16px',
  backgroundColor: grey[100],
  color: grey[700],
  fontSize: '0.875rem',
  fontWeight: 500,
  borderBottom: `1px solid ${grey[200]}`,
  zIndex: 10,
  ...theme.applyStyles('dark', {
    backgroundColor: grey[800],
    color: grey[300],
    borderBottom: `1px solid ${grey[700]}`,
  }),
}));

const GroupItems = styled('ul')({
  padding: 0,
  '& li': {
    position: 'relative',
    zIndex: 1,
    '&[aria-selected="true"]': {
      zIndex: 5,
      backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
    },
    '&:hover': {
      zIndex: 5,
    },
  },
});

const normalize = (value: string) => value.trim().toLowerCase();

const matchesInput = (user: MiniUser, input: string) =>
  normalize(`${user.firstName} ${user.lastName} ${user.email}`).includes(normalize(input));

const byName = (a: MiniUser, b: MiniUser) =>
  `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'fr', { sensitivity: 'base' });

export type SearchUserSelectProps = {
  label?: string;
  disabled?: boolean;
  onChange: (value: OptionType) => void;
  excludedEmails: string[];
  acceptNewUsers?: boolean;
};

/**
 * Picks a user among the people the current user already attends an event with (searched by name or
 * email), or by the exact email of any account. The rest of the user base is never searchable: the
 * exact-email lookup is rate limited by the API.
 */
export const SearchUserSelect = ({
  disabled,
  onChange,
  excludedEmails,
  label,
  acceptNewUsers = true,
}: SearchUserSelectProps) => {
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setKeyword(inputValue.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  const { data: closestFriends = [] } = useUserClosestFriendsQuery(
    { limit: CLOSEST_FRIENDS_LIMIT },
    { select: d => (d.closestFriends.__typename === 'ClosestFriendsOutput' ? d.closestFriends.users : []) },
  );

  const searchEnabled = keyword.length >= SEARCH_MIN_LENGTH;
  const { data: circleResults = [], isFetching: searching } = useSearchUsersSelectQuery(
    { keyword },
    {
      enabled: searchEnabled,
      staleTime: 60_000,
      select: d => (d.searchUsers.__typename === 'SearchUsersOutput' ? d.searchUsers.users : []),
    },
  );

  const circleUsers = useMemo(
    () => uniqBy([...closestFriends, ...circleResults], user => user.id),
    [closestFriends, circleResults],
  );

  // Only look an exact email up when nobody of the circle has it: every lookup counts against a quota
  const email = isValidEmail(keyword) ? normalize(keyword) : '';
  const emailInCircle = circleUsers.some(user => normalize(user.email) === email);
  const lookupEnabled = email !== '' && !emailInCircle && !excludedEmails.includes(email);
  const { data: emailLookup, isFetching: lookingUp } = useUserByEmailQuery(
    { email },
    {
      enabled: lookupEnabled,
      // A lookup is never repeated for the same email (window focus, remount...)
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
      retry: false,
      refetchOnWindowFocus: false,
      select: d => d.userByEmail,
    },
  );

  const emailLookupDone = lookupEnabled && emailLookup !== undefined && !lookingUp;
  const emailUser = emailLookupDone && emailLookup?.__typename === 'UserByEmailOutput' ? emailLookup.user : null;
  const rateLimited =
    emailLookupDone &&
    emailLookup?.__typename === 'BusinessRuleRejection' &&
    emailLookup.code === BusinessRuleCode.RateLimited;

  const options = useMemo<OptionType[]>(() => {
    const input = inputValue.trim();
    const circleOptions = circleUsers
      .filter(user => input === '' || matchesInput(user, input))
      .map<UserOptionType>(user => ({ ...user, group: 'circle' }));

    // Closest friends first (by number of shared events), then the other search results by name
    const friendIds = new Set(closestFriends.map(user => user.id));
    const sortedCircleOptions = [
      ...circleOptions.filter(user => friendIds.has(user.id)),
      ...circleOptions.filter(user => !friendIds.has(user.id)).sort(byName),
    ];

    const result: OptionType[] = [...sortedCircleOptions];

    if (emailUser && normalize(input) === email) {
      result.push({ ...emailUser, group: 'email' });
    }

    // No account found (or the lookup was refused): the address can still be invited
    const canInvite = acceptNewUsers && emailLookupDone && !emailUser && normalize(input) === email;
    if (canInvite) {
      result.push(email);
    }

    return result;
  }, [inputValue, circleUsers, closestFriends, emailUser, email, emailLookupDone, acceptNewUsers]);

  const loading = searching || lookingUp || inputValue.trim() !== keyword;

  const noOptionsText = (() => {
    if (email && emailLookupDone && !emailUser && !acceptNewUsers) return 'Aucun compte avec cet email';
    if (inputValue.trim().length < SEARCH_MIN_LENGTH) return 'Tapez un nom ou un email';
    return 'Aucun résultat';
  })();

  const helperText = (() => {
    if (rateLimited) return 'Trop de recherches par email, réessayez plus tard';
    if (acceptNewUsers) {
      return "Vous ne trouvez pas la personne ? Entrez son email complet pour l'inviter sur Wishlist";
    }
    return 'Recherchez parmi vos amis, ou entrez un email complet';
  })();

  return (
    <Autocomplete<OptionType>
      fullWidth
      clearOnBlur={false}
      blurOnSelect={false}
      disableCloseOnSelect={true}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        // MUI resets the input to the selected label on selection: we clear it in onChange instead
        if (reason !== 'reset') setInputValue(newInputValue);
      }}
      loadingText="Chargement..."
      noOptionsText={noOptionsText}
      disabled={disabled}
      options={options}
      loading={loading}
      filterOptions={values => values}
      onChange={(_, value) => {
        if (value) {
          onChange(value);
          setInputValue('');
        }
      }}
      groupBy={option => (typeof option === 'string' ? GROUP_LABELS.invite : GROUP_LABELS[option.group])}
      renderGroup={params => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      getOptionDisabled={option => excludedEmails.includes(typeof option === 'string' ? option : option.email)}
      getOptionLabel={option =>
        typeof option === 'string'
          ? `Inviter le participant par son email: ${option}`
          : `${option.firstName} ${option.lastName} (${option.email})`
      }
      isOptionEqualToValue={(option, value) =>
        typeof option === 'string' || typeof value === 'string' ? option === value : option.id === value.id
      }
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Stack
            direction="row"
            sx={{
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Avatar
              sx={{
                width: '30px',
                height: '30px',
                bgcolor: typeof option === 'string' ? orange[100] : blue[100],
                color: typeof option === 'string' ? orange[600] : blue[600],
              }}
              src={typeof option === 'string' ? undefined : (option.pictureUrl ?? undefined)}
            >
              <PersonIcon />
            </Avatar>
            {typeof option === 'string' ? (
              <>
                <span>Inviter le participant par son email:</span>
                <b>{option}</b>
              </>
            ) : (
              <>
                <b>
                  {option.firstName} {option.lastName}
                </b>
                <span>({option.email})</span>
              </>
            )}
          </Stack>
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder="Rechercher un participant ..."
          helperText={helperText}
          error={rateLimited}
        />
      )}
    />
  );
};
