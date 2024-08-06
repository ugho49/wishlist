import { Init1661984005903 } from './1661984005903-Init'
import { addGoogleAuth1672933463658 } from './1672933463658-add-google-auth'
import { addWishlistLogo1699627478472 } from './1699627478472-add-wishlist-logo'
import { addItemImage1699629898987 } from './1699629898987-add-item-image'
import { ReplaceCreatorOfEventByAttendee1722894610304 } from './1722894610304-replace-creator-of-event-by-attendee'

// To create a new migration run `nx run api:typeorm-generate-migration NAME_OF_MIGRATION`
export default [
  Init1661984005903,
  addGoogleAuth1672933463658,
  addWishlistLogo1699627478472,
  addItemImage1699629898987,
  ReplaceCreatorOfEventByAttendee1722894610304,
]
