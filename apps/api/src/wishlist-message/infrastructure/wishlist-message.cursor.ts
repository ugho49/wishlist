import type { WishlistMessageId } from '@wishlist/common'

export function encodeCursor(createdAt: Date, id: WishlistMessageId): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url')
}

export function decodeCursor(cursor: string): { createdAt: Date; id: WishlistMessageId } {
  const decoded = Buffer.from(cursor, 'base64url').toString()
  const separatorIndex = decoded.indexOf('|')
  const createdAt = decoded.substring(0, separatorIndex)
  const id = decoded.substring(separatorIndex + 1)
  return { createdAt: new Date(createdAt), id: id as WishlistMessageId }
}
