import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './eventsSlice.js';
import titlesReducer from './titlesSlice.js';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    titles: titlesReducer,
  },
});
