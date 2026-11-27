/** The API rate limits invitations per user and per day (RATE_LIMITED business rule). */
export const INVITATIONS_RATE_LIMITED_MESSAGE =
  "Vous avez atteint la limite d'invitations pour aujourd'hui, réessayez demain";

/** Reminders count against the same daily email quota as the invitations (RATE_LIMITED business rule). */
export const REMINDERS_RATE_LIMITED_MESSAGE =
  "Vous avez atteint la limite d'emails envoyés aujourd'hui (invitations et relances), réessayez demain";
