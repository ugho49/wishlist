import { ParseFilePipe } from '@nestjs/common';
import { FileTypeValidator, MaxFileSizeValidator, ResizeImagePipe } from '../../core/bucket';

export const userPictureFileValidators = new ParseFilePipe({
  validators: [
    new FileTypeValidator({
      fileType: 'image/(png|jpeg|jpg|webp|gif|avif|tiff|tif|svg)',
      errorMessage: "Le fichier n'est pas une image supportée par le serveur",
    }),
    new MaxFileSizeValidator({
      maxSize: 1024 * 1024 * 6,
      errorMessage: 'Le fichier doit faire 6 Mo au maximum',
    }),
  ],
});

export const userPictureResizePipe = new ResizeImagePipe({ width: 500, height: 500 });
