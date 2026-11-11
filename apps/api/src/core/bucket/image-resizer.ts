import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

/** Media types accepted for the uploaded pictures (user avatars, wishlist logos). */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/tif',
  'image/svg+xml',
] as const;

/** Maximum size of an uploaded picture. */
export const MAX_IMAGE_SIZE = '6mb';

export const IMAGE_TOO_LARGE_MESSAGE = 'Le fichier doit faire 6 Mo au maximum';
export const IMAGE_TYPE_NOT_SUPPORTED_MESSAGE = "Le fichier n'est pas une image supportée par le serveur";

/** Resizes uploaded pictures to WebP (keeps the original file when it cannot be decoded). */
@Injectable()
export class ImageResizer {
  private readonly logger = getLogger(ImageResizer.name);

  async resize(image: File, options: { width: number; height: number }): Promise<File> {
    try {
      const buffer = await new Bun.Image(await image.arrayBuffer())
        .resize(options.width, options.height)
        .webp()
        .toBuffer();
      return new File([new Uint8Array(buffer)], image.name, { type: 'image/webp' });
    } catch (e) {
      this.logger.error('Fail to resize image', { error: e });
      return image;
    }
  }
}
