import type { RootState } from '../../core'

import { Stack, styled } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'

import { uploadUserPicture } from '../../api/upload'
import { updatePicture } from '../../core/store/features'
import {
  isRejection,
  rejectionMessage,
  useRemoveCurrentUserPictureMutation,
  useUpdateUserPictureFromSocialMutation,
} from '../../gql'
import { useToast } from '../../hooks/useToast'
import { Loader } from '../common/Loader'
import { AvatarUpdateButton } from './AvatarUpdateButton'

const mapState = (state: RootState) => state.userProfile

const ProfileContainer = styled(Stack)(() => ({}))

export const ProfilePictureSection = () => {
  const dispatch = useDispatch()
  const userState = useSelector(mapState)
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { mutateAsync: updatePictureFromSocial } = useUpdateUserPictureFromSocialMutation()
  const { mutateAsync: removePicture } = useRemoveCurrentUserPictureMutation()

  const invalidateCurrentUser = () => queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] })

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl))
    void invalidateCurrentUser()
  }

  return (
    <Loader loading={!userState.isUserLoaded} sx={{ marginBlock: '40px' }}>
      <ProfileContainer>
        <AvatarUpdateButton
          pictureUrl={userState.pictureUrl}
          socials={userState.social || []}
          onPictureUpdated={handlePictureUpdated}
          uploadPictureHandler={file => uploadUserPicture(file)}
          updatePictureFromSocialHandler={async socialId => {
            const res = await updatePictureFromSocial({ input: { socialId } })
            if (isRejection(res.updateUserPictureFromSocial)) {
              addToast({ message: rejectionMessage(res.updateUserPictureFromSocial), variant: 'error' })
              // AvatarUpdateButton applies the new picture unless the handler throws
              throw new Error(rejectionMessage(res.updateUserPictureFromSocial))
            }
          }}
          deletePictureHandler={async () => {
            const res = await removePicture({})
            if (isRejection(res.removeUserPicture)) {
              addToast({ message: rejectionMessage(res.removeUserPicture), variant: 'error' })
              // AvatarUpdateButton removes the picture unless the handler throws
              throw new Error(rejectionMessage(res.removeUserPicture))
            }
          }}
          size="120px"
        />
      </ProfileContainer>
    </Loader>
  )
}
