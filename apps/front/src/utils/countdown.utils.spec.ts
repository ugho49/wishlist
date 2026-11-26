import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getCountdown } from './countdown.utils';

const now = DateTime.fromISO('2026-11-26T18:30:00');

describe('getCountdown', () => {
  it('counts whole days, whatever the time of day', () => {
    expect(getCountdown('2026-12-08T08:00:00', now)).toEqual({ label: 'Dans 12 jours', className: 'accent' });
  });

  it('says tomorrow the day before', () => {
    expect(getCountdown('2026-11-27T00:00:00', now)).toEqual({ label: 'Demain', className: 'accent' });
  });

  it('celebrates the day itself', () => {
    expect(getCountdown('2026-11-26T09:00:00', now)).toEqual({ label: "C'est aujourd'hui !", className: 'success' });
  });

  it('marks past events as finished', () => {
    expect(getCountdown('2026-11-20', now)).toEqual({ label: 'Terminé' });
  });
});
