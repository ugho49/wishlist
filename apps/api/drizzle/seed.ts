import { faker } from '@faker-js/faker'
import { createConsola } from 'consola'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { reset } from 'drizzle-seed'
import { sample } from 'lodash'
import { Client } from 'pg'

import { addDays, addYears } from '../../../libs/common/src/utils/date.utils'

import { PasswordManager } from '../src/auth/infrastructure/util/password-manager'
import * as schema from './schema'

dotenv.config()

const consola = createConsola()

const usersValues: (typeof schema.user.$inferInsert)[] = []
const userEmailSettingValues: (typeof schema.userEmailSetting.$inferInsert)[] = []
const eventsValues: (typeof schema.event.$inferInsert)[] = []
const eventAttendeesValues: (typeof schema.eventAttendee.$inferInsert)[] = []
const wishlistsValues: (typeof schema.wishlist.$inferInsert)[] = []
const eventWishlistsValues: (typeof schema.eventWishlist.$inferInsert)[] = []
const itemsValues: (typeof schema.item.$inferInsert)[] = []

const getRandomUser = () => sample(usersValues)!
const getAttendeesForUser = (userId: string) => eventAttendeesValues.filter(attendee => attendee.userId === userId)

function getRandomUserWithExclusion(exclude: string) {
  let attempts = 0
  let user: typeof schema.user.$inferInsert | undefined
  const users = usersValues.filter(user => user.id !== exclude)
  while (user === undefined && attempts < 10) {
    const fetchedUser = sample(users)!

    if (fetchedUser.id !== exclude) {
      user = fetchedUser!
    } else {
      attempts++
    }
  }

  if (attempts === 10) {
    throw new Error('Failed to get a random user with exclusion')
  }

  return user!
}

async function main() {
  consola.box('Database seeding')

  const client = new Client({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: false,
  })

  try {
    consola.start('Checking database connection...')
    await client.connect()
    consola.success('Connected to the database !')
  } catch (error) {
    consola.error('Failed to connect to the database', error)
    process.exit(1)
  }

  const db = drizzle(client)

  const shouldReset = await consola.prompt('Do you want to reset the database?', {
    type: 'confirm',
    initial: true,
  })

  if (shouldReset) {
    consola.start('Resetting database in progress...')
    await reset(db, schema)
    consola.success('Database reset completed')
  }

  consola.start('Seeding users and settings...')
  const usersPasswordEnc = await PasswordManager.hash('test')

  usersValues.push({
    id: 'bc675663-8dce-4977-a4ab-146db663580e', // admin id is hardcoded in the seed
    email: 'admin@admin.fr',
    firstName: 'Admin',
    lastName: 'ADMIN',
    pictureUrl: faker.image.avatar(),
    authorities: ['ROLE_SUPERADMIN'],
    passwordEnc: usersPasswordEnc,
  })

  for (let i = 0; i < 100; i++) {
    usersValues.push({
      id: faker.string.uuid(),
      email: `test${i}@test.fr`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      birthday: faker.date.birthdate().toISOString(),
      pictureUrl: faker.image.avatar(),
      authorities: ['ROLE_USER'],
      passwordEnc: usersPasswordEnc,
    })
  }

  await db.insert(schema.user).values(usersValues)

  consola.success(`${usersValues.length} users seeded`)

  for (const user of usersValues) {
    userEmailSettingValues.push({
      id: faker.string.uuid(),
      userId: user.id,
      dailyNewItemNotification: faker.datatype.boolean({ probability: 0.9 }),
    })
  }

  await db.insert(schema.userEmailSetting).values(userEmailSettingValues)

  consola.success(`${userEmailSettingValues.length} users settings seeded`)

  consola.start('Seeding events and attendees...')

  for (let i = 0; i < 100; i++) {
    const isPastEvent = faker.datatype.boolean({ probability: 0.3 })
    const hasDescription = faker.datatype.boolean({ probability: 0.3 })

    const event: typeof schema.event.$inferInsert = {
      id: faker.string.uuid(),
      title: faker.book.title(),
      eventDate: isPastEvent
        ? faker.date.past().toISOString()
        : faker.date
            .between({
              from: addDays(new Date(), 1),
              to: addYears(new Date(), 1),
            })
            .toISOString(),
      description: hasDescription ? faker.lorem.paragraph() : undefined,
    }

    eventsValues.push(event)

    const maintainer = getRandomUser()
    eventAttendeesValues.push({
      id: faker.string.uuid(),
      eventId: event.id,
      userId: maintainer.id,
      role: 'maintainer',
    })

    const numberOfAttendees = faker.number.int({ min: 0, max: 10 })

    for (let j = 0; j < numberOfAttendees; j++) {
      const isTempAttendee = faker.datatype.boolean({ probability: 0.2 })

      if (isTempAttendee) {
        eventAttendeesValues.push({
          id: faker.string.uuid(),
          eventId: event.id,
          tempUserEmail: faker.internet.email(),
          role: 'user',
        })
      } else {
        const attendee = getRandomUserWithExclusion(maintainer.id)

        eventAttendeesValues.push({
          id: faker.string.uuid(),
          eventId: event.id,
          userId: attendee.id,
          role: 'user',
        })
      }
    }
  }

  await db.insert(schema.event).values(eventsValues)
  consola.success(`${eventsValues.length} events seeded`)
  await db.insert(schema.eventAttendee).values(eventAttendeesValues)
  consola.success(`${eventAttendeesValues.length} event attendees seeded`)

  consola.start('Seeding wishlists...')

  for (const user of usersValues) {
    const attendees = getAttendeesForUser(user.id)

    if (attendees.length === 0) {
      continue
    }

    const hasWishlist = faker.datatype.boolean({ probability: 0.7 })

    if (!hasWishlist) {
      continue
    }

    const userAttendeeEventIds = attendees.map(attendee => attendee.eventId) as string[]
    const getRandomUserAttendeeEventId = () => sample(userAttendeeEventIds)!

    const getRandomUserAttendeeEventIdWithExclusion = (exclude: string[]) => {
      let attempts = 0
      let eventId: string | undefined
      const eventIds = userAttendeeEventIds.filter(eventId => !exclude.includes(eventId))

      while (eventId === undefined && attempts < 10) {
        const fetchedEventId = sample(eventIds)!

        if (exclude.includes(fetchedEventId)) {
          attempts++
        } else {
          eventId = fetchedEventId
        }
      }

      if (attempts === 10) {
        throw new Error('Failed to get a random user attendee event id')
      }

      return eventId!
    }

    const numberOfWishlists = faker.number.int({ min: 1, max: 5 })

    for (let i = 0; i < numberOfWishlists; i++) {
      const hasDescription = faker.datatype.boolean({ probability: 0.3 })
      const wishlist: typeof schema.wishlist.$inferInsert = {
        id: faker.string.uuid(),
        title: `Liste de ${user.firstName} ${user.lastName}`,
        ownerId: user.id,
        description: hasDescription ? faker.lorem.paragraph() : undefined,
        hideItems: faker.datatype.boolean({ probability: 0.99 }),
      }

      wishlistsValues.push(wishlist)

      const belongsToMultipleEvents = faker.datatype.boolean({ probability: 0.2 }) && userAttendeeEventIds.length > 1

      const eventIds: string[] = []

      if (belongsToMultipleEvents) {
        const numberOfEventsToAdd = faker.number.int({ min: 1, max: userAttendeeEventIds.length - 1 })

        for (let j = 0; j < numberOfEventsToAdd; j++) {
          const eventId = getRandomUserAttendeeEventIdWithExclusion(eventIds)
          eventIds.push(eventId)
        }
      } else {
        const eventId = getRandomUserAttendeeEventId()
        eventIds.push(eventId)
      }

      for (const eventId of eventIds) {
        eventWishlistsValues.push({
          eventId,
          wishlistId: wishlist.id,
        })
      }
    }
  }

  await db.insert(schema.wishlist).values(wishlistsValues)
  await db.insert(schema.eventWishlist).values(eventWishlistsValues)
  consola.success(`${wishlistsValues.length} wishlists seeded`)

  consola.start('Seeding items...')

  for (const wishlist of wishlistsValues) {
    const numberOfItems = faker.number.int({ min: 0, max: 10 })

    for (let i = 0; i < numberOfItems; i++) {
      const isSuggested = faker.datatype.boolean({ probability: 0.1 })
      const hasDescription = faker.datatype.boolean({ probability: 0.3 })
      const hasScore = faker.datatype.boolean({ probability: 0.4 })

      itemsValues.push({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        wishlistId: wishlist.id,
        pictureUrl: faker.image.urlPicsumPhotos(),
        description: hasDescription ? faker.commerce.productDescription() : undefined,
        score: hasScore ? faker.number.int({ min: 1, max: 5 }) : undefined,
        isSuggested,
      })
    }
  }

  await db.insert(schema.item).values(itemsValues)
  consola.success(`${itemsValues.length} items seeded`)

  consola.box('Seeding complete')
  process.exit(0)
}

main()
  .then(() => {
    consola.box('Seeding complete')
    process.exit(0)
  })
  .catch(error => {
    consola.error('Failed to seed the database', error)
    process.exit(1)
  })
