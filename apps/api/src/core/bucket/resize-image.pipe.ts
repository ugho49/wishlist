import { Logger, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

type OptionsResizeImagePipe = { width: number; height: number };

export class ResizeImagePipe implements PipeTransform<Express.Multer.File> {
  private readonly logger = new Logger(ResizeImagePipe.name);

  constructor(private readonly options: OptionsResizeImagePipe) {}

  async transform(image: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      const buffer = await sharp(image.buffer, { failOn: 'none' })
        .resize({
          width: this.options.width,
          height: this.options.height,
          fit: 'cover',
        })
        .webp({ effort: 3 })
        .toBuffer();
      return { ...image, buffer, mimetype: 'image/webp' };
    } catch (e) {
      this.logger.error('Fail to resize image', e);
      return image;
    }
  }
}
