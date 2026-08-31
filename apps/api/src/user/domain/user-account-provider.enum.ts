export enum UserAccountProvider {
  PASSWORD = 'password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export type SocialAccountProvider = UserAccountProvider.GOOGLE | UserAccountProvider.FACEBOOK;

export function isSocialAccountProvider(provider: UserAccountProvider): provider is SocialAccountProvider {
  return provider !== UserAccountProvider.PASSWORD;
}
