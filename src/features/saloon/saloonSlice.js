import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  saloons: [],
  selectedSaloon: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const saloonSlice = createSlice({
  name: 'saloon',
  initialState,
  reducers: {
    setSaloons: (state, action) => {
      state.saloons = action.payload.saloons;
      state.pagination = action.payload.pagination;
    },
    setSelectedSaloon: (state, action) => {
      state.selectedSaloon = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setSaloons, setSelectedSaloon, setLoading, setError } = saloonSlice.actions;
export default saloonSlice.reducer;
