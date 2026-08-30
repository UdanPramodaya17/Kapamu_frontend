import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import saloonReducer from '../features/saloon/saloonSlice';
import bookingReducer from '../features/booking/bookingSlice';
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    saloon: saloonReducer,
    booking: bookingReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;
