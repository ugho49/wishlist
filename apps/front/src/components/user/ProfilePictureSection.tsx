import type { RootState } from '../../core/store';

import { Stack, styled } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import { uploadUserPicture } from '../../api/upload';
import { updatePicture } from '../../core/store/features/userProfileSlice';
import {
  rejectionMessage,
  rejectionPattern,
  useRemoveCurrentUserPictureMutation,
  useUpdateUserPictureFromSocialMutation,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../common/Loader';
import { AvatarUpdateButton } from './AvatarUpdateButton';

const mapState = (state: RootState) => state.userProfile;

const ProfileContainer = styled(Stack)(() => ({}));

export const ProfilePictureSection = () => {
  const dispatch = useDispatch();
  const userState = useSelector(mapState);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { mutateAsync: updatePictureFromSocial } = useUpdateUserPictureFromSocialMutation();
  const { mutateAsync: removePicture } = useRemoveCurrentUserPictureMutation();

  const invalidateCurrentUser = () => queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] });

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl));
    void invalidateCurrentUser();
  };

  return (
    <Loader loading={!userState.isUserLoaded} sx={{ marginBlock: '40px' }}>
      <ProfileContainer>
        <AvatarUpdateButton
          pictureUrl={userState.pictureUrl}
          socials={userState.social || []}
          onPictureUpdated={handlePictureUpdated}
          uploadPictureHandler={file => uploadUserPicture(file)}
          updatePictureFromSocialHandler={async socialId => {
            const res = await updatePictureFromSocial({ input: { socialId } });
            match(res.updateUserPictureFromSocial)
              .with({ __typename: 'VoidOutput' }, () => undefined)
              .with(rejectionPattern, rejection => {
                addToast({ message: rejectionMessage(rejection), variant: 'error' });
                // AvatarUpdateButton applies the new picture unless the handler throws
                throw new Error(rejectionMessage(rejection));
              })
              .exhaustive();
          }}
          deletePictureHandler={async () => {
            const res = await removePicture({});
            match(res.removeUserPicture)
              .with({ __typename: 'VoidOutput' }, () => undefined)
              .with(rejectionPattern, rejection => {
                addToast({ message: rejectionMessage(rejection), variant: 'error' });
                // AvatarUpdateButton removes the picture unless the handler throws
                throw new Error(rejectionMessage(rejection));
              })
              .exhaustive();
          }}
          size="120px"
        />
      </ProfileContainer>
    </Loader>
  );
};
