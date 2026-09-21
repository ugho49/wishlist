import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { type Ref, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useDispatch } from 'react-redux';
import { match } from 'ts-pattern';

import { updateUser as updateUserAction } from '../../core/store/features/userProfileSlice';
import {
  rejectionMessage,
  rejectionPattern,
  useUpdateUserProfileMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { WishlistDatePicker } from '../common/DatePicker';

export type WelcomeBirthdayStepHandle = {
  save: () => Promise<boolean>;
};

type WelcomeBirthdayStepProps = {
  ref: Ref<WelcomeBirthdayStepHandle>;
  disabled?: boolean;
};

export const WelcomeBirthdayStep = ({ ref, disabled = false }: WelcomeBirthdayStepProps) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useUserProfileCurrentUserQuery(undefined, {
    select: query => query.currentUser,
  });
  const user = data?.__typename === 'User' ? data : undefined;
  const [birthday, setBirthday] = useState<DateTime | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { mutateAsync: updateProfile } = useUpdateUserProfileMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  useEffect(() => {
    if (!user || initialized) {
      return;
    }

    setBirthday(user.birthday ? DateTime.fromISO(user.birthday) : null);
    setInitialized(true);
  }, [initialized, user]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!birthday) {
      return true;
    }

    if (!user) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
      return false;
    }

    const birthdayValue = birthday.toISODate();
    if (!birthdayValue) {
      addToast({ message: 'Date de naissance invalide', variant: 'error' });
      return false;
    }

    const profileResult = await updateProfile({
      input: {
        firstname: user.firstName,
        lastname: user.lastName,
        birthday: birthdayValue,
      },
    });

    const saved = match(profileResult.updateUserProfile)
      .with({ __typename: 'User' }, () => {
        dispatch(
          updateUserAction({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            pictureUrl: user.pictureUrl ?? undefined,
            birthday: birthdayValue,
          }),
        );
        void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] });
        return true;
      })
      .with(rejectionPattern, rejection => {
        addToast({ message: rejectionMessage(rejection), variant: 'error' });
        return false;
      })
      .exhaustive();

    return saved;
  }, [addToast, birthday, dispatch, queryClient, updateProfile, user]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  return (
    <WishlistDatePicker
      label="Date de naissance"
      value={birthday}
      onChange={setBirthday}
      referenceDate={DateTime.now().minus({ year: 20 })}
      disableFuture
      disabled={disabled}
      fullWidth
    />
  );
};
