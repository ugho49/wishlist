import { PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

type OptionsResizeImagePipe = { width: number; height: number };

export class ResizeImagePipe implements PipeTransform<Express.Multer.File, Promise<string>> {
  constructor(private readonly options: OptionsResizeImagePipe) {}

  async transform(image: Express.Multer.File): Promise<any> {
    const buffer = await sharp(image.buffer)
      .resize(this.options.width, this.options.height)
      .webp({ effort: 3 })
      .toBuffer();

    return { ...image, buffer, mimetype: 'image/webp' };
  }
}
