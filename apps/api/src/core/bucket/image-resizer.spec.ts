import { BadRequestException } from '@znight/http';

import { detectImageMimeType, IMAGE_TYPE_NOT_SUPPORTED_MESSAGE, ImageResizer } from './image-resizer';
import { describe, expect, it } from 'bun:test';

// 1x1 transparent PNG
const PNG_BYTES = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
  char => char.charCodeAt(0),
);

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('detectImageMimeType', () => {
  it.each([
    ['image/png', PNG_BYTES],
    ['image/jpeg', Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])],
    ['image/gif', bytesOf('GIF89a\x01\x00\x01\x00')],
    ['image/webp', bytesOf('RIFF\x00\x00\x00\x00WEBPVP8 ')],
    ['image/tiff', Uint8Array.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00])],
    ['image/avif', bytesOf('\x00\x00\x00\x1cftypavif\x00\x00\x00\x00')],
    ['image/heic', bytesOf('\x00\x00\x00\x18ftypheic\x00\x00\x00\x00')],
    ['image/heif', bytesOf('\x00\x00\x00\x18ftypmif1\x00\x00\x00\x00')],
  ])('should detect %s from the magic numbers', (expected, bytes) => {
    expect(detectImageMimeType(bytes)).toBe(expected);
  });

  it.each([
    ['an SVG', bytesOf('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')],
    ['an HTML page', bytesOf('<!doctype html><html></html>')],
    ['an MP4 video', bytesOf('\x00\x00\x00\x18ftypisom\x00\x00\x00\x00')],
    ['an empty file', new Uint8Array()],
  ])('should not detect %s as an image', (_, bytes) => {
    expect(detectImageMimeType(bytes)).toBeUndefined();
  });
});

describe('ImageResizer', () => {
  const resizer = new ImageResizer();
  const size = { width: 500, height: 500 };

  it('should re-encode a real image to WebP whatever the declared media type', async () => {
    const resized = await resizer.resize(
      new File([PNG_BYTES], 'avatar.bin', { type: 'application/octet-stream' }),
      size,
    );

    expect(resized.type).toBe('image/webp');
    expect(detectImageMimeType(new Uint8Array(await resized.arrayBuffer()))).toBe('image/webp');
  });

  it('should refuse a script-carrying SVG declared as an image', async () => {
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], 'a.svg', {
      type: 'image/svg+xml',
    });

    const error = await resizer.resize(svg, size).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).message).toBe(IMAGE_TYPE_NOT_SUPPORTED_MESSAGE);
  });

  it('should refuse arbitrary bytes declared as a PNG', async () => {
    const file = new File(['<html><body>not an image</body></html>'], 'a.png', { type: 'image/png' });

    await expect(resizer.resize(file, size)).rejects.toThrow(IMAGE_TYPE_NOT_SUPPORTED_MESSAGE);
  });

  it('should keep the original bytes with the detected type when the image cannot be decoded', async () => {
    const truncated = PNG_BYTES.subarray(0, 16);

    const result = await resizer.resize(new File([truncated], 'a.gif', { type: 'image/gif' }), size);

    expect(result.type).toBe('image/png');
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(truncated);
  });
});
