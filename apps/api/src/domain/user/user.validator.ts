import { ParseFilePipe } from '@nestjs/common'
import { ACCEPTED_IMG_FORMATS } from '@wishlist/common'

import { FileTypeValidator, MaxFileSizeValidator, ResizeImagePipe } from '../../core/bucket'

export const userPictureFileValidators = new ParseFilePipe({
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
})

export const userPictureResizePipe = new ResizeImagePipe({ width: 500, height: 500 })
