import { match } from 'ts-pattern';

import { UserAccountProvider } from '../../../gql';

export function getAccountProviderLabel(provider: UserAccountProvider): string {
  return match(provider)
    .with(UserAccountProvider.Password, () => 'Mot de passe')
    .with(UserAccountProvider.Google, () => 'Google')
    .with(UserAccountProvider.Facebook, () => 'Facebook')
    .exhaustive();
}
