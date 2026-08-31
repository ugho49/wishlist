import { Chip, styled } from '@mui/material';
import { match } from 'ts-pattern';

import { UserAccountProvider } from '../../../gql';

export type UserAccountProviderChipProps = {
  provider: UserAccountProvider;
};

export function getAccountProviderLabel(provider: UserAccountProvider): string {
  return match(provider)
    .with(UserAccountProvider.Password, () => 'Mot de passe')
    .with(UserAccountProvider.Google, () => 'Google')
    .with(UserAccountProvider.Facebook, () => 'Facebook')
    .exhaustive();
}

const ProviderChip = styled(Chip, { shouldForwardProp: prop => prop !== 'providerVariant' })<{
  providerVariant: UserAccountProvider;
}>(({ theme, providerVariant }) => ({
  height: 24,
  fontWeight: 600,
  fontSize: '0.75rem',
  maxWidth: '100%',
  alignSelf: 'center',
  ...match(providerVariant)
    .with(UserAccountProvider.Password, () => ({
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.secondary,
      border: `1px solid ${theme.palette.grey[300]}`,
    }))
    .with(UserAccountProvider.Google, () => ({
      backgroundColor: '#e0f2fe',
      color: theme.palette.primary.main,
      border: '1px solid #7dd3fc',
    }))
    .with(UserAccountProvider.Facebook, () => ({
      backgroundColor: '#eef2ff',
      color: '#3b5998',
      border: '1px solid #c7d2fe',
    }))
    .exhaustive(),
  '& .MuiChip-label': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

export const UserAccountProviderChip = ({ provider }: UserAccountProviderChipProps) => (
  <ProviderChip providerVariant={provider} size="small" label={getAccountProviderLabel(provider)} />
);
