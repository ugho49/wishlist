import { SignupSource } from '../../gql';

export const signupSourceOptions = [
  { value: SignupSource.Google, label: 'Google' },
  { value: SignupSource.Friends, label: 'Amis ou proches' },
  { value: SignupSource.Social, label: 'Réseaux sociaux' },
  { value: SignupSource.Other, label: 'Autre' },
] as const;

export function formatSignupSource(source?: SignupSource | null, detail?: string | null): string {
  if (!source) {
    return 'Non renseignée';
  }

  const label = signupSourceOptions.find(option => option.value === source)?.label ?? source;
  if (source === SignupSource.Other && detail) {
    return `${label} — ${detail}`;
  }

  return label;
}
