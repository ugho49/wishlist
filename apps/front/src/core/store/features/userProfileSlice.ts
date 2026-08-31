import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserAccountId, UserId } from '@wishlist/common';
import type { UserAccount } from '../../../gql';

import { createSlice } from '@reduxjs/toolkit';

export interface UserProfileState {
  id?: UserId;
  firstName?: string;
  lastName?: string;
  email?: string;
  pictureUrl?: string;
  birthday?: string;
  accounts?: UserAccount[];
  isUserLoaded: boolean;
}

type StateWithoutIsUserLoaded = Omit<UserProfileState, 'isUserLoaded'>;

const initialState: UserProfileState = {
  id: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  pictureUrl: undefined,
  birthday: undefined,
  accounts: [],
  isUserLoaded: false,
};

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUser: (_, action: PayloadAction<StateWithoutIsUserLoaded>) => ({
      ...action.payload,
      isUserLoaded: true,
    }),
    updateUser: (state, action: PayloadAction<Omit<StateWithoutIsUserLoaded, 'id' | 'accounts'>>) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.pictureUrl = action.payload.pictureUrl;
      state.email = action.payload.email;
      state.birthday = action.payload.birthday;
    },
    addUserAccount: (state, action: PayloadAction<UserAccount>) => {
      state.accounts = [...(state.accounts || []), action.payload];
    },
    removeUserAccount: (state, action: PayloadAction<UserAccountId>) => {
      state.accounts = (state.accounts || []).filter(account => account.id !== action.payload);
    },
    updatePicture: (state, action: PayloadAction<UserProfileState['pictureUrl']>) => {
      state.pictureUrl = action.payload;
    },
    resetUserState: () => initialState,
  },
});

export const { setUser, resetUserState, updatePicture, updateUser, addUserAccount, removeUserAccount } =
  userProfileSlice.actions;
