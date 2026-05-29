import type { RootState } from '../../core'

import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  styled,
  Typography,
  Zoom,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'

import { uploadUserPicture } from '../../api/upload'
import { updatePicture } from '../../core/store/features'
import {
  useRemoveCurrentUserPictureMutation,
  useUpdateUserPictureFromSocialMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql'
import { unwrapResult } from '../../gql/result'
import { AvatarUpdateButton } from './AvatarUpdateButton'

type ProfilePicturePromptModalProps = {
  open: boolean
  onClose: () => void
}

const mapState = (state: RootState) => state.userProfile.pictureUrl

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(2),
    maxWidth: 500,
    width: '90vw',
  },
}))

const StyledBackdrop = styled(Backdrop)(() => ({
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
}))

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}))

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}))

const ModalDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.6,
}))

const ActionSection = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
}))

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(3),
}))

const SecondaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '0.9rem',
}))

export const ProfilePicturePromptModal = ({ open, onClose }: ProfilePicturePromptModalProps) => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { data: user } = useUserProfileCurrentUserQuery(undefined, {
    select: d => unwrapResult(d.currentUser, 'User'),
  })
  const pictureUrl = useSelector(mapState)

  const { mutateAsync: updatePictureFromSocial } = useUpdateUserPictureFromSocialMutation()
  const { mutateAsync: removePicture } = useRemoveCurrentUserPictureMutation()

  const handleClose = () => {
    onClose()
  }

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl))
    void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] })
  }

  return (
    <StyledDialog open={open} slots={{ backdrop: StyledBackdrop, transition: Zoom }} maxWidth="sm" fullWidth>
      <DialogContent>
        <HeaderSection>
          <ModalTitle variant="h5">Personnalisez votre profil ! 📸</ModalTitle>
          <ModalDescription variant="body1">
            Ajoutez votre photo de profil pour que vos amis vous reconnaissent facilement lors des échanges de cadeaux
            et des événements.
          </ModalDescription>
        </HeaderSection>

        <AvatarUpdateButton
          pictureUrl={pictureUrl}
          socials={user?.socials || []}
          onPictureUpdated={handlePictureUpdated}
          uploadPictureHandler={file => uploadUserPicture(file)}
          updatePictureFromSocialHandler={async socialId => {
            const res = await updatePictureFromSocial({ input: { socialId } })
            unwrapResult(res.updateUserPictureFromSocial, 'VoidOutput')
          }}
          deletePictureHandler={async () => {
            const res = await removePicture({})
            unwrapResult(res.removeUserPicture, 'VoidOutput')
          }}
          size="120px"
        />
      </DialogContent>

      <DialogActions>
        <ActionSection direction="row" justifyContent="center" width="100%">
          {!pictureUrl && (
            <SecondaryButton variant="outlined" onClick={handleClose}>
              Plus tard
            </SecondaryButton>
          )}
          {pictureUrl && (
            <PrimaryButton variant="contained" onClick={onClose}>
              Continuer
            </PrimaryButton>
          )}
        </ActionSection>
      </DialogActions>
    </StyledDialog>
  )
}
