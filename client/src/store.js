import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './eventsSlice.js';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
  },
});
