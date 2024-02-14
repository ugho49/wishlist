import { Logger, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

type OptionsResizeImagePipe = { width: number; height: number };

export class ResizeImagePipe implements PipeTransform<Express.Multer.File> {
  private readonly logger = new Logger(ResizeImagePipe.name);
  private readonly fileIsRequired: boolean;

  constructor(
    private readonly options: OptionsResizeImagePipe,
    fileIsRequired?: boolean,
  ) {
    this.fileIsRequired = fileIsRequired ?? true;
  }

  async transform(image: Express.Multer.File): Promise<Express.Multer.File> {
    if (!this.fileIsRequired && image === undefined) {
      return image;
    }
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
