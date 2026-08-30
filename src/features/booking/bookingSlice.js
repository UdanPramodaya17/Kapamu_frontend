import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSaloon: null,
  selectedBarber: null,
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
  step: 1, // 1=saloon, 2=service, 3=barber, 4=slot, 5=confirm
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingSaloon: (state, action) => {
      state.selectedSaloon = action.payload;
      state.selectedBarber = null;
      state.selectedService = null;
      state.selectedSlot = null;
    },
    setBookingService: (state, action) => {
      state.selectedService = action.payload;
      state.selectedSlot = null;
    },
    setBookingBarber: (state, action) => {
      state.selectedBarber = action.payload;
      state.selectedSlot = null;
    },
    setBookingDate: (state, action) => {
      state.selectedDate = action.payload;
      state.selectedSlot = null;
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
    },
    setSlotsLoading: (state, action) => {
      state.slotsLoading = action.payload;
    },
    setSlotsError: (state, action) => {
      state.slotsError = action.payload;
    },
    setBookingStep: (state, action) => {
      state.step = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const {
  setBookingSaloon,
  setBookingService,
  setBookingBarber,
  setBookingDate,
  setSelectedSlot,
  setAvailableSlots,
  setSlotsLoading,
  setSlotsError,
  setBookingStep,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
