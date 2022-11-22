import { Dispatch } from '@reduxjs/toolkit';
import { resetAuthState } from './authSlice';

export * from './authSlice';

export const logout = (dispatch: Dispatch) => {
  dispatch(resetAuthState());
};
