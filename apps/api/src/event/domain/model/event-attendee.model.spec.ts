import { EventAttendeeBuilder } from '../../../../test-utils/builders/event-attendee.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WISHLIST_REMINDER_COOLDOWN_IN_HOURS } from './event-attendee.model';
import { describe, expect, it } from 'bun:test';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('EventAttendee', () => {
  describe('wishlist reminder', () => {
    const now = new Date('2026-12-01T10:00:00.000Z');
    const attendee = new EventAttendeeBuilder().withUser(new UserBuilder().build()).build();

    it('can be reminded when never reminded before', () => {
      expect(attendee.lastRemindedAt).toBeUndefined();
      expect(attendee.canBeRemindedAt(now)).toBe(true);
    });

    it('stores the reminder date', () => {
      const reminded = attendee.remind(now);

      expect(reminded.lastRemindedAt).toEqual(now);
      expect(reminded.id).toBe(attendee.id);
      expect(reminded.user).toBe(attendee.user);
      expect(attendee.lastRemindedAt).toBeUndefined();
    });

    it('cannot be reminded again during the cooldown', () => {
      const reminded = attendee.remind(now);
      const justBeforeCooldownEnd = new Date(now.getTime() + WISHLIST_REMINDER_COOLDOWN_IN_HOURS * ONE_HOUR_IN_MS - 1);

      expect(reminded.canBeRemindedAt(justBeforeCooldownEnd)).toBe(false);
      expect(() => reminded.remind(justBeforeCooldownEnd)).toThrow('Attendee was reminded too recently');
    });

    it('can be reminded again once the cooldown is over', () => {
      const reminded = attendee.remind(now);
      const cooldownEnd = new Date(now.getTime() + WISHLIST_REMINDER_COOLDOWN_IN_HOURS * ONE_HOUR_IN_MS);

      expect(reminded.canBeRemindedAt(cooldownEnd)).toBe(true);
      expect(reminded.remind(cooldownEnd).lastRemindedAt).toEqual(cooldownEnd);
    });

    it('keeps the reminder date when a pending attendee signs up', () => {
      const pending = new EventAttendeeBuilder().withPendingEmail('pending@test.fr').build().remind(now);

      const converted = pending.convertTemporaryAttendeeToUser(new UserBuilder().build());

      expect(converted.lastRemindedAt).toEqual(now);
    });
  });
});
