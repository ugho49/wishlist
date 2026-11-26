import { join } from 'node:path';
import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { DateTime } from 'luxon';

const MIGRATION_FILE = join(import.meta.dir, '../../../drizzle/migrations/0021_backfill-past-item-purchases.sql');

const noonUtc = (day: DateTime) => new Date(`${day.toFormat('yyyy-MM-dd')}T12:00:00.000Z`);
const daysAgo = (days: number) => DateTime.now().minus({ days }).toJSDate();

describe('Migration 0021_backfill-past-item-purchases', () => {
  const { getFixtures, expectTable, runSql } = useTestApp();
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  it('should mark as purchased only the gifts of wishlists whose events are all over', async () => {
    const ownerId = await fixtures.insertUser({ email: 'owner@test.fr', firstname: 'Ada', lastname: 'Lovelace' });
    const takerId = await fixtures.insertUser({ email: 'taker@test.fr', firstname: 'Alan', lastname: 'Turing' });

    const lastPastEventDay = DateTime.now().minus({ days: 30 });
    const { eventId: olderPastEventId } = await fixtures.insertEventWithMaintainer({
      title: 'Noël dernier',
      eventDate: noonUtc(DateTime.now().minus({ days: 90 })),
      maintainerId: ownerId,
    });
    const { eventId: pastEventId } = await fixtures.insertEventWithMaintainer({
      title: 'Anniversaire passé',
      eventDate: noonUtc(lastPastEventDay),
      maintainerId: ownerId,
    });
    const { eventId: upcomingEventId } = await fixtures.insertEventWithMaintainer({
      title: 'Noël prochain',
      eventDate: noonUtc(DateTime.now().plus({ days: 30 })),
      maintainerId: ownerId,
    });

    const pastWishlistId = await fixtures.insertWishlist({
      eventIds: [olderPastEventId, pastEventId],
      userId: ownerId,
      title: 'Passée',
    });
    const mixedWishlistId = await fixtures.insertWishlist({
      eventIds: [pastEventId, upcomingEventId],
      userId: ownerId,
      title: 'Passée et à venir',
    });
    const noEventWishlistId = await fixtures.insertWishlist({ eventIds: [], userId: ownerId, title: 'Sans évènement' });

    const alreadyPurchasedAt = daysAgo(40);
    const reservedAfterEventAt = daysAgo(10);
    await fixtures.insertItem({ wishlistId: pastWishlistId, name: 'Avant', takerId, takenAt: daysAgo(60) });
    const alreadyPurchasedId = await fixtures.insertItem({ wishlistId: pastWishlistId, name: 'Déjà acheté' });
    await fixtures.insertItemTaker({
      itemId: alreadyPurchasedId,
      userId: takerId,
      takenAt: daysAgo(50),
      purchasedAt: alreadyPurchasedAt,
    });
    await fixtures.insertItem({ wishlistId: mixedWishlistId, name: 'À venir', takerId, takenAt: daysAgo(45) });
    await fixtures.insertItem({ wishlistId: noEventWishlistId, name: 'Sans date', takerId, takenAt: daysAgo(42) });
    await fixtures.insertItem({ wishlistId: pastWishlistId, name: 'Après', takerId, takenAt: reservedAfterEventAt });
    await fixtures.insertItem({ wishlistId: pastWishlistId, name: 'Personne' });

    await runSql(await Bun.file(MIGRATION_FILE).text());

    await expectTable(Fixtures.ITEM_TAKER_TABLE, { taken_at: 'ASC' })
      .hasNumberOfRows(5)
      // Reserved before the last event: bought on its day
      .row(0)
      .toMatchObject({ purchased_at: noonUtc(lastPastEventDay) })
      // An existing purchase is kept
      .row(1)
      .toMatchObject({ purchased_at: alreadyPurchasedAt })
      // The wishlist still has an upcoming event
      .row(2)
      .toMatchObject({ purchased_at: null })
      // The wishlist has no event
      .row(3)
      .toMatchObject({ purchased_at: null })
      // Reserved after the last event: bought on the reservation
      .row(4)
      .toMatchObject({ purchased_at: reservedAfterEventAt });
  });
});
