import type { Dispatch } from '@reduxjs/toolkit'

import { resetAuthState } from './authSlice'
import { resetUserState } from './userProfileSlice'

export * from './authSlice'
export * from './drawerSlice'
export * from './userProfileSlice'

export const resetStore = (dispatch: Dispatch) => {
  dispatch(resetAuthState())
  dispatch(resetUserState())
}
