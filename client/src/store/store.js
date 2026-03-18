import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './eventsSlice.js';
import themeReducer from './themeSlice.js';
import titlesReducer from './titlesSlice.js';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    theme: themeReducer,
    titles: titlesReducer,
  },
});
