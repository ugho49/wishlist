import type { RootState } from '../../core'

import { Stack, styled } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'

import { uploadUserPicture } from '../../api/upload'
import { updatePicture } from '../../core/store/features'
import { useRemoveCurrentUserPictureMutation, useUpdateUserPictureFromSocialMutation } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { Loader } from '../common/Loader'
import { AvatarUpdateButton } from './AvatarUpdateButton'

const mapState = (state: RootState) => state.userProfile

const ProfileContainer = styled(Stack)(() => ({}))

export const ProfilePictureSection = () => {
  const dispatch = useDispatch()
  const userState = useSelector(mapState)
  const queryClient = useQueryClient()

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
            unwrapResult(res.updateUserPictureFromSocial, 'VoidOutput')
          }}
          deletePictureHandler={async () => {
            const res = await removePicture({})
            unwrapResult(res.removeUserPicture, 'VoidOutput')
          }}
          size="120px"
        />
      </ProfileContainer>
    </Loader>
  )
}
