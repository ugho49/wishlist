/**
 * Minimal REST helpers for the multipart/form-data endpoints that intentionally
 * stay on REST (GraphQL handles JSON only here). Everything else goes through
 * the generated GraphQL hooks.
 *
 * Auth + base URL mirror the GraphQL fetcher (`../gql/fetcher`): the access
 * token is read from localStorage and the base URL from the environment.
 */
import type { UserId, WishlistId } from '@wishlist/common'

import { LS_KEYS } from '../core/services/auth.service'
import { environment } from '../environment'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function postForm<T>(path: string, form: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  // NB: do not set Content-Type manually — the browser adds the multipart boundary.
  const response = await fetch(`${environment.apiBaseUrl}${path}`, {
    method,
    headers: authHeaders(),
    body: form,
  })

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export type UploadPictureResult = { picture_url: string }
export type UploadLogoResult = { logo_url: string }

export function uploadUserPicture(file: File): Promise<UploadPictureResult> {
  const form = new FormData()
  form.append('file', file)
  return postForm('/user/upload-picture', form)
}

export function uploadAdminUserPicture(userId: UserId, file: File): Promise<UploadPictureResult> {
  const form = new FormData()
  form.append('file', file)
  return postForm(`/admin/user/${userId}/upload-picture`, form)
}

export function uploadWishlistLogo(wishlistId: WishlistId, file: File): Promise<UploadLogoResult> {
  const form = new FormData()
  form.append('file', file)
  return postForm(`/wishlist/${wishlistId}/upload-logo`, form)
}

/**
 * Wishlist creation stays on REST because it accepts an optional image upload.
 * `data` is the JSON payload (serialized into the `data` field) and `image` is
 * the optional logo file. Returns the created wishlist id.
 */
export function createWishlistMultipart<T = { id: WishlistId }>(data: unknown, image?: File): Promise<T> {
  const form = new FormData()
  form.append('data', JSON.stringify(data))
  if (image) {
    form.append('image', image)
  }
  return postForm('/wishlist', form)
}
