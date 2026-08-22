import type { PipeTransform } from '@nestjs/common';

import { Logger } from '@nestjs/common';

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
      const buffer = await new Bun.Image(image.buffer)
        .resize(this.options.width, this.options.height)
        .webp()
        .toBuffer();
      return { ...image, buffer, mimetype: 'image/webp' };
    } catch (e) {
      this.logger.error('Fail to resize image', e);
      return image;
    }
  }
}
