import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// export const fetchEvents = createAsyncThunk('events/fetch', async () => {
//   const res = await fetch('/api/events');
//   if (!res.ok) {
//     throw new Error('Не удалось загрузить события');
//   }
//   return res.json();
// });

// export const addEvent = createAsyncThunk('events/add', async (payload) => {
//   const res = await fetch('/api/events', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || 'Не удалось добавить событие');
//   }
//   return res.json();
// });

// export const updateEvent = createAsyncThunk('events/update', async (payload) => {
//   const res = await fetch(`/api/events/${payload.id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || 'Не удалось обновить событие');
//   }
//   return res.json();
// });

// export const deleteEvent = createAsyncThunk('events/delete', async (id) => {
//   const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || 'Не удалось удалить событие');
//   }
//   return id;
// });

const titlesSlice = createSlice({
  name: 'titles',
  initialState: {
    items: ['1','2'],
    status: 'idle',
    error: null,
  },
  reducers: {},
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchEvents.pending, (state) => {
  //       state.status = 'loading';
  //       state.error = null;
  //     })
  //     .addCase(fetchEvents.fulfilled, (state, action) => {
  //       state.status = 'succeeded';
  //       state.items = action.payload;
  //     })
  //     .addCase(fetchEvents.rejected, (state, action) => {
  //       state.status = 'failed';
  //       state.error = action.error.message;
  //     })
  //     .addCase(addEvent.fulfilled, (state, action) => {
  //       state.items.unshift(action.payload);
  //     })
  //     .addCase(updateEvent.fulfilled, (state, action) => {
  //       const idx = state.items.findIndex((item) => item.id === action.payload.id);
  //       if (idx !== -1) state.items[idx] = action.payload;
  //     })
  //     .addCase(deleteEvent.fulfilled, (state, action) => {
  //       state.items = state.items.filter((item) => item.id !== action.payload);
  //     })
  //     .addCase(addEvent.rejected, (state, action) => {
  //       state.error = action.error.message;
  //     })
  //     .addCase(updateEvent.rejected, (state, action) => {
  //       state.error = action.error.message;
  //     })
  //     .addCase(deleteEvent.rejected, (state, action) => {
  //       state.error = action.error.message;
  //     });
  // },
});

export default titlesSlice.reducer;
