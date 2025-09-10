import type { RootState } from '../../core'

import { Stack, styled } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { updatePicture } from '../../core/store/features'
import { useApi } from '../../hooks/useApi'
import { Loader } from '../common/Loader'
import { AvatarUpdateButton } from './AvatarUpdateButton'

const mapState = (state: RootState) => state.userProfile

const ProfileContainer = styled(Stack)(() => ({}))

export const ProfilePictureSection = () => {
  const dispatch = useDispatch()
  const userState = useSelector(mapState)
  const api = useApi()

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl))
  }

  return (
    <Loader loading={!userState.isUserLoaded} sx={{ marginBlock: '40px' }}>
      <ProfileContainer>
        <AvatarUpdateButton
          pictureUrl={userState.pictureUrl}
          socials={userState.social || []}
          onPictureUpdated={handlePictureUpdated}
          uploadPictureHandler={file => api.user.uploadPicture(file)}
          updatePictureFromSocialHandler={socialId => api.user.updatePictureFromSocial(socialId)}
          deletePictureHandler={() => api.user.deletePicture()}
          size="120px"
        />
      </ProfileContainer>
    </Loader>
  )
}
