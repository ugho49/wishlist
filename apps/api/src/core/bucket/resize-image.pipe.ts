import { PipeTransform } from '@nestjs/common';
import * as Jimp from 'jimp';

type OptionsResizeImagePipe = { width: number; height: number };

export class ResizeImagePipe implements PipeTransform<Express.Multer.File> {
  constructor(private readonly options: OptionsResizeImagePipe) {}

  async transform(image: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      const buffer = await Jimp.read(image.buffer).then((img) =>
        img.cover(this.options.width, this.options.height).quality(60).getBufferAsync(Jimp.MIME_JPEG)
      );
      return { ...image, buffer, mimetype: Jimp.MIME_JPEG };
    } catch (e) {
      console.error('Fail to resize image', e);
      return image;
    }
  }
}
