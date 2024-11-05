import type { UpdateUserPictureOutputDto, UserSocialDto } from '@wishlist/common-types'

import GoogleIcon from '@mui/icons-material/Google'
import NoPhotographyIcon from '@mui/icons-material/NoPhotography'
import PortraitIcon from '@mui/icons-material/Portrait'
import { Avatar, CircularProgress, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import React, { useRef, useState } from 'react'

import { useToast } from '../../hooks/useToast'
import { ACCEPT_IMG, sanitizeImgToUrl } from '../../utils/images.utils'
import { AvatarCropperModal } from '../common/AvatarCropperModal'

export type AvatarUpdateButtonProps = {
  firstname: string
  lastname: string
  uploadPictureHandler: (file: File) => Promise<UpdateUserPictureOutputDto>
  updatePictureFromSocialHandler: (socialId: string) => Promise<void>
  deletePictureHandler: () => Promise<void>
  onPictureUpdated: (pictureUrl: string | undefined) => void
  pictureUrl?: string
  socials: UserSocialDto[]
  size?: string
}

export const AvatarUpdateButton = ({
  pictureUrl,
  firstname,
  lastname,
  socials,
  uploadPictureHandler,
  updatePictureFromSocialHandler,
  deletePictureHandler,
  onPictureUpdated,
  size = '60px',
}: AvatarUpdateButtonProps) => {
  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const { addToast } = useToast()
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElMenu(event.currentTarget)
  const closeMenu = () => setAnchorElMenu(null)

  const removePicture = async () => {
    setLoading(true)
    closeMenu()
    try {
      await deletePictureHandler()
      onPictureUpdated(undefined)
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const selectAPicture = () => {
    closeMenu()
    inputFileRef.current?.click()
  }

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    const imageDataUrl = await sanitizeImgToUrl(file)

    setImageSrc(imageDataUrl)

    e.target.value = ''
  }

  const uploadProfilePicture = async (file: File) => {
    setLoading(true)

    try {
      const res = await uploadPictureHandler(file)
      onPictureUpdated(res.picture_url)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (e as any)?.response?.data?.message as string
      addToast({ message: error || "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const updateWithSocialPicture = async (social?: UserSocialDto) => {
    closeMenu()

    if (!social) return

    setLoading(true)

    try {
      await updatePictureFromSocialHandler(social.id)
      onPictureUpdated(social.picture_url!)
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {imageSrc && (
        <AvatarCropperModal
          imageSrc={imageSrc}
          handleClose={() => setImageSrc(undefined)}
          handleSave={file => {
            setImageSrc(undefined)
            uploadProfilePicture(file)
          }}
        />
      )}
      {!loading && (
        <Avatar
          src={pictureUrl}
          onClick={openMenu}
          sx={{ width: size, height: size, ':hover': { opacity: 0.7, cursor: 'pointer' } }}
        >
          {`${firstname.substring(0, 1).toUpperCase()}${lastname.substring(0, 1).toUpperCase()}`}
        </Avatar>
      )}
      {loading && (
        <Avatar sx={{ width: size, height: size }}>
          <CircularProgress color="inherit" size="18px" thickness={5} />
        </Avatar>
      )}
      <input ref={inputFileRef} type="file" hidden accept={ACCEPT_IMG} onChange={onFileInputChange} />
      <Menu anchorEl={anchorElMenu} open={Boolean(anchorElMenu)} onClose={closeMenu}>
        <MenuItem onClick={() => selectAPicture()}>
          <ListItemIcon>
            <PortraitIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mettre à jour la photo de profil</ListItemText>
        </MenuItem>
        {pictureUrl && (
          <MenuItem onClick={() => removePicture()}>
            <ListItemIcon>
              <NoPhotographyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Supprimer la photo</ListItemText>
          </MenuItem>
        )}
        {socials.find(s => s.social_type === 'google') && (
          <MenuItem onClick={() => updateWithSocialPicture(socials.find(s => s.social_type === 'google'))}>
            <ListItemIcon>
              <GoogleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Utiliser ma photo google</ListItemText>
            <ListItemIcon sx={{ marginLeft: '50px', justifyContent: 'flex-end' }}>
              <Avatar
                src={socials.find(s => s.social_type === 'google')?.picture_url}
                sx={{ width: '20px', height: '20px' }}
              />
            </ListItemIcon>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
