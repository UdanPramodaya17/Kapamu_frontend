import { createSlice } from '@reduxjs/toolkit';

const user = JSON.parse(localStorage.getItem('salon_user') || 'null');
const access = localStorage.getItem('salon_token') || null;

const initialState = {
  user: user,
  accessToken: access,
  isAuthenticated: !!user && !!access,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('salon_user', JSON.stringify(user));
      localStorage.setItem('salon_token', accessToken);
      if (refreshToken) localStorage.setItem('salon_refresh', refreshToken);
    },
    updateToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('salon_token', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('salon_refresh', action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('salon_user');
      localStorage.removeItem('salon_token');
      localStorage.removeItem('salon_refresh');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, updateToken, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAccessToken = (state) => state.auth.accessToken;
