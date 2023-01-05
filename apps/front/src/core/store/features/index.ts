import { Dispatch } from '@reduxjs/toolkit';
import { resetAuthState } from './authSlice';
import { resetUserState } from './userProfileSlice';

export * from './authSlice';
export * from './userProfileSlice';

export const logout = (dispatch: Dispatch) => {
  dispatch(resetAuthState());
  dispatch(resetUserState());
};
