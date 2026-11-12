import { Injectable } from '@znight/core';
import { BadRequestException } from '@znight/http';
import { getLogger } from '@znight/observability';

/** Maximum size of an uploaded picture. */
export const MAX_IMAGE_SIZE = '6mb';

export const IMAGE_TOO_LARGE_MESSAGE = 'Le fichier doit faire 6 Mo au maximum';
export const IMAGE_TYPE_NOT_SUPPORTED_MESSAGE = "Le fichier n'est pas une image supportée par le serveur";

/** Brands of the ISO base media file format (`ftyp` box) used by AVIF and HEIC/HEIF pictures. */
const ISO_BMFF_IMAGE_BRANDS: Readonly<Record<string, string>> = {
  avif: 'image/avif',
  avis: 'image/avif',
  heic: 'image/heic',
  heix: 'image/heic',
  hevc: 'image/heic',
  hevx: 'image/heic',
  heim: 'image/heic',
  heis: 'image/heic',
  mif1: 'image/heif',
  msf1: 'image/heif',
};

const hasBytes = (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean =>
  bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte);

const ascii = (bytes: Uint8Array, start: number, end: number): string =>
  bytes.length >= end ? String.fromCharCode(...bytes.subarray(start, end)) : '';

/**
 * Detects the media type of a picture from its magic numbers, never from what the client declares.
 * Only the accepted formats are detected (PNG, JPEG, GIF, WebP, TIFF, AVIF, HEIC/HEIF): anything
 * else, SVG included, gives `undefined`.
 */
export function detectImageMimeType(bytes: Uint8Array): string | undefined {
  if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a') return 'image/gif';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp';
  if (hasBytes(bytes, [0x49, 0x49, 0x2a, 0x00]) || hasBytes(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return 'image/tiff';
  if (ascii(bytes, 4, 8) === 'ftyp') return ISO_BMFF_IMAGE_BRANDS[ascii(bytes, 8, 12)];
  return undefined;
}

/**
 * Checks and resizes the uploaded pictures (user avatars, wishlist logos). A file whose content is not
 * a supported image is refused with a 400, whatever media type the client declared. The picture is
 * re-encoded to WebP; when it cannot be decoded, the original bytes are kept with the detected type.
 */
@Injectable()
export class ImageResizer {
  private readonly logger = getLogger(ImageResizer.name);

  async resize(image: File, options: { width: number; height: number }): Promise<File> {
    const bytes = new Uint8Array(await image.arrayBuffer());
    const detectedType = detectImageMimeType(bytes);
    if (!detectedType) {
      throw new BadRequestException(IMAGE_TYPE_NOT_SUPPORTED_MESSAGE);
    }

    try {
      const buffer = await new Bun.Image(bytes).resize(options.width, options.height).webp().toBuffer();
      return new File([new Uint8Array(buffer)], image.name, { type: 'image/webp' });
    } catch (e) {
      this.logger.error('Fail to resize image', { error: e });
      return new File([bytes], image.name, { type: detectedType });
    }
  }
}
