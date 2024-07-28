import { Dispatch } from '@reduxjs/toolkit'

import { resetAuthState } from './authSlice'
import { resetUserState } from './userProfileSlice'

export * from './authSlice'
export * from './userProfileSlice'

export const resetStore = (dispatch: Dispatch) => {
  dispatch(resetAuthState())
  dispatch(resetUserState())
}
