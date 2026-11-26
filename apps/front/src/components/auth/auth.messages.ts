/** The API rate limits login attempts per email and per client address (RATE_LIMITED business rule). */
export const LOGIN_RATE_LIMITED_MESSAGE = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes';

/** The API rate limits account creations (sign-up form and first Google login) per client address. */
export const SIGN_UP_RATE_LIMITED_MESSAGE =
  'Trop de comptes ont été créés depuis votre connexion. Veuillez réessayer dans une heure';

/** The API rate limits reset password emails per email and per client address. */
export const RESET_PASSWORD_RATE_LIMITED_MESSAGE =
  'Trop de demandes de réinitialisation du mot de passe. Veuillez réessayer dans une heure';

/** The API answers the same way whether the email has an account or not: the message must not tell either. */
export const RESET_PASSWORD_EMAIL_SENT_MESSAGE =
  'Si un compte existe pour cette adresse, un email vient de vous être envoyé pour réinitialiser le mot de passe';
