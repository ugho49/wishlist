import PersonIcon from '@mui/icons-material/Person'
import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import React, { useState } from 'react'

import { ACCEPT_IMG, sanitizeImgToUrl } from '../../utils/images.utils'
import { AvatarCropperModal } from '../common/AvatarCropperModal'
import { InputLabel } from '../common/InputLabel'

type WishlistLogoActionsProps = {
  logoUrl?: string
  loading: boolean
  onLogoChange: (file: File) => void
  onLogoRemove: () => void
}

export const WishlistLogoActions = (props: WishlistLogoActionsProps) => {
  const { logoUrl, loading, onLogoChange, onLogoRemove } = props
  const [tmpLogoSrc, setTmpLogoSrc] = useState<string | undefined>()

  const onLogoInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    const imageDataUrl = await sanitizeImgToUrl(file)

    setTmpLogoSrc(imageDataUrl)

    e.target.value = ''
  }

  return (
    <>
      {tmpLogoSrc && (
        <AvatarCropperModal
          imageSrc={tmpLogoSrc}
          handleClose={() => setTmpLogoSrc(undefined)}
          handleSave={file => {
            setTmpLogoSrc(undefined)
            onLogoChange(file)
          }}
        />
      )}
      <Box>
        <InputLabel>Logo de la liste</InputLabel>
        <Stack direction="row" gap={2}>
          <Avatar src={logoUrl} sx={{ width: 70, height: 70, bgcolor: grey[200], color: grey[400] }}>
            <PersonIcon fontSize="large" />
          </Avatar>

          <Stack direction="column" justifyContent="center" gap={1} marginLeft={5}>
            <Box>
              <Button variant="outlined" component="label" disabled={loading} size="small">
                Choisir une image
                <input type="file" hidden accept={ACCEPT_IMG} onChange={onLogoInputChange} />
              </Button>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                disabled={!logoUrl || loading}
                size="small"
                color="error"
                onClick={() => onLogoRemove()}
              >
                Supprimer l'image
              </Button>
            </Box>
          </Stack>
        </Stack>
        <br />
        <Typography variant="caption">
          En l'absence d'image, le logo utilisé sera la photo de profile du créateur de la liste
        </Typography>
      </Box>
    </>
  )
}
