import { ParseFilePipe } from '@nestjs/common';
import { ACCEPTED_IMG_FORMATS } from '@wishlist/common';

import { ResizeImagePipe } from '../../core/bucket/pipe/resize-image.pipe';
import { FileTypeValidator } from '../../core/bucket/validators/file-type.validator';
import { MaxFileSizeValidator } from '../../core/bucket/validators/max-file-size.validator';

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

export const wishlistLogoResizePipe = (fileIsRequired: boolean) =>
  new ResizeImagePipe({ width: 500, height: 500 }, fileIsRequired);
