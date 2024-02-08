import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfileState {
  firstName?: string;
  lastName?: string;
  pictureUrl?: string;
}

const initialState: UserProfileState = {};

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfileState>) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.pictureUrl = action.payload.pictureUrl;
    },
    updateUser: (state, action: PayloadAction<{ firstName?: string; lastName?: string }>) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },
    updatePicture: (state, action: PayloadAction<UserProfileState['pictureUrl']>) => {
      state.pictureUrl = action.payload;
    },
    resetUserState: (state) => {
      state.firstName = undefined;
      state.lastName = undefined;
      state.pictureUrl = undefined;
    },
  },
});

export const { setUser, resetUserState, updatePicture, updateUser } = userProfileSlice.actions;
