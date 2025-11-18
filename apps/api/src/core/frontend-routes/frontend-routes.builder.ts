import type { EventId, WishlistId } from '@wishlist/common'

export const frontendRoutesBuilder = (baseUrl: string) => ({
  home: () => baseUrl,
  wishlist: {
    byId: (wishlistId: WishlistId) => `${baseUrl}/wishlists/${wishlistId}`,
  },
  event: {
    byId: (eventId: EventId) => `${baseUrl}/events/${eventId}`,
  },
  user: {
    register: () => `${baseUrl}/register`,
    resetPassword: (params: { email: string; token: string }) => {
      const url = new URL(`${baseUrl}/forgot-password/renew`)
      url.searchParams.append('email', params.email)
      url.searchParams.append('token', params.token)
      return url.toString()
    },
    confirmEmailChange: (params: { email: string; token: string }) => {
      const url = new URL(`${baseUrl}/confirm-email-change`)
      url.searchParams.append('email', params.email)
      url.searchParams.append('token', params.token)
      return url.toString()
    },
  },
})
