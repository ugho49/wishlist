import type { UpdateUserPictureOutputDto, UserSocialDto } from '@wishlist/common'

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import EditIcon from '@mui/icons-material/Edit'
import GoogleIcon from '@mui/icons-material/Google'
import NoPhotographyIcon from '@mui/icons-material/NoPhotography'
import PortraitIcon from '@mui/icons-material/Portrait'
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import clsx from 'clsx'
import React, { useRef, useState } from 'react'

import { useToast } from '../../hooks/useToast'
import { ACCEPT_IMG, sanitizeImgToUrl } from '../../utils/images.utils'
import { AvatarCropperModal } from '../common/AvatarCropperModal'

const AvatarSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
}))

const AvatarContainer = styled(Box)(() => ({
  position: 'relative',
}))

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  '&.clickable': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      opacity: 0.9,
      cursor: 'pointer',
    },
  },
  '&.with-picture': {
    border: `4px solid ${theme.palette.primary.main}`,
  },
}))

const MenuButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: -4,
  right: -4,
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
  boxShadow: theme.shadows[3],
}))

export type AvatarUpdateButtonProps = {
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
    if (!file) return

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

      <AvatarSection>
        <AvatarContainer>
          <StyledAvatar
            src={!loading ? pictureUrl : undefined}
            className={clsx(!pictureUrl && 'clickable', pictureUrl && 'with-picture')}
            onClick={!pictureUrl ? () => selectAPicture() : undefined}
            sx={{ width: size, height: size }}
          >
            {loading && (
              <CircularProgress
                thickness={4}
                sx={{ color: 'white', width: `calc(${size} / 3)`, height: `calc(${size} / 3)` }}
              />
            )}
            {!loading && (
              <AddAPhotoIcon sx={{ color: 'white', width: `calc(${size} / 3)`, height: `calc(${size} / 3)` }} />
            )}
          </StyledAvatar>
          {pictureUrl && (
            <MenuButton onClick={openMenu}>
              <EditIcon fontSize="small" />
            </MenuButton>
          )}
        </AvatarContainer>

        {!pictureUrl && (
          <Stack alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Cliquez sur l'icône ci-dessus pour ajouter une photo
            </Typography>
          </Stack>
        )}
      </AvatarSection>

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
