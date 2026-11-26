import { DateTime } from 'luxon';

export type Countdown = {
  label: string;
  /** Styling hint for the countdown chip: `success` on the day, `accent` before it. */
  className?: 'success' | 'accent';
};

/** Days left before an event, as shown on the event header ("Dans 12 jours", "Demain", ...). */
export const getCountdown = (eventDate: string, now: DateTime = DateTime.now()): Countdown => {
  const days = Math.round(DateTime.fromISO(eventDate).startOf('day').diff(now.startOf('day'), 'days').days);
  if (days < 0) return { label: 'Terminé' };
  if (days === 0) return { label: "C'est aujourd'hui !", className: 'success' };
  if (days === 1) return { label: 'Demain', className: 'accent' };
  return { label: `Dans ${days} jours`, className: 'accent' };
};
