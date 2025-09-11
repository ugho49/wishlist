import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserId, UserSocialDto, UserSocialId } from '@wishlist/common'

import { createSlice } from '@reduxjs/toolkit'

export interface UserProfileState {
  id?: UserId
  firstName?: string
  lastName?: string
  email?: string
  pictureUrl?: string
  birthday?: string
  social?: UserSocialDto[]
  isUserLoaded: boolean
}

type StateWithoutIsUserLoaded = Omit<UserProfileState, 'isUserLoaded'>

const initialState: UserProfileState = {
  id: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  pictureUrl: undefined,
  birthday: undefined,
  social: [],
  isUserLoaded: false,
}

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUser: (_, action: PayloadAction<StateWithoutIsUserLoaded>) => ({
      ...action.payload,
      isUserLoaded: true,
    }),
    updateUser: (state, action: PayloadAction<Omit<StateWithoutIsUserLoaded, 'id' | 'social'>>) => {
      state.firstName = action.payload.firstName
      state.lastName = action.payload.lastName
      state.pictureUrl = action.payload.pictureUrl
      state.email = action.payload.email
      state.birthday = action.payload.birthday
    },
    addUserSocial: (state, action: PayloadAction<UserSocialDto>) => {
      state.social = [...(state.social || []), action.payload]
    },
    removeUserSocial: (state, action: PayloadAction<UserSocialId>) => {
      state.social = (state.social || []).filter(s => s.id !== action.payload)
    },
    updatePicture: (state, action: PayloadAction<UserProfileState['pictureUrl']>) => {
      state.pictureUrl = action.payload
    },
    resetUserState: () => initialState,
  },
})

export const { setUser, resetUserState, updatePicture, updateUser, addUserSocial, removeUserSocial } =
  userProfileSlice.actions
