import { ACCEPTED_IMG_FORMATS } from '@wishlist/common-types'
import { getOrientation } from 'get-orientation/browser'

import { getRotatedImage } from './canvas.utils'

export const ACCEPT_IMG = ACCEPTED_IMG_FORMATS.map(fmt => `image/${fmt}`).join(',')

const ORIENTATION_TO_ANGLE = {
  '1': null,
  '2': null,
  '3': 180,
  '4': null,
  '5': null,
  '6': 90,
  '7': null,
  '8': -90,
}

function readFileToURL(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string), false)
    reader.readAsDataURL(file)
  })
}

export async function sanitizeImgToUrl(file: File) {
  let imageDataUrl = await readFileToURL(file)

  try {
    // apply rotation if needed
    const orientation = await getOrientation(file)
    const rotation = ORIENTATION_TO_ANGLE[`${orientation}`]
    if (rotation) {
      imageDataUrl = await getRotatedImage(imageDataUrl, rotation)
    }
  } catch {
    console.warn('failed to detect the orientation')
  }
  return imageDataUrl
}
