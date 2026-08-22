import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from './features/authSlice';
import { drawerSlice } from './features/drawerSlice';
import { userProfileSlice } from './features/userProfileSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    userProfile: userProfileSlice.reducer,
    drawer: drawerSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
