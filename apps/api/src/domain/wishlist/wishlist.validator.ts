import { ParseFilePipe } from '@nestjs/common';
import { FileTypeValidator, MaxFileSizeValidator, ResizeImagePipe } from '../../core/bucket';
import { ACCEPTED_IMG_FORMATS } from '@wishlist/common-types';

export const wishlistLogoFileValidators = (fileIsRequired: boolean) =>
  new ParseFilePipe({
    validators: [
      new FileTypeValidator({
        fileType: `image/(${ACCEPTED_IMG_FORMATS.join('|')})`,
        errorMessage: "Le fichier n'est pas une image supportée par le serveur",
      }),
      new MaxFileSizeValidator({
        maxSize: 1024 * 1024 * 6,
        errorMessage: 'Le fichier doit faire 6 Mo au maximum',
      }),
    ],
    fileIsRequired,
  });

export const wishlistLogoResizePipe = new ResizeImagePipe({ width: 500, height: 500 });
