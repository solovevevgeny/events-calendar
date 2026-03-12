import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchTitles = createAsyncThunk('events/fetch', async () => {
  const res = await fetch('/api/titles');
  if (!res.ok) {
    throw new Error('Не удалось загрузить события');
  }
  return res.json();
});

export const addTitle = createAsyncThunk('events/add', async (payload) => {
  const res = await fetch('/api/titles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Не удалось добавить событие');
  }
  return res.json();
});

export const updateTitle = createAsyncThunk('events/update', async (payload) => {
  const res = await fetch(`/api/titles/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Не удалось обновить событие');
  }
  return res.json();
});

export const deleteTitle = createAsyncThunk('events/delete', async (id) => {
  const res = await fetch(`/api/titles/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Не удалось удалить событие');
  }
  return id;
});

const titlesSlice = createSlice({
  name: 'titles',
  initialState: {
    items: ['1','2'],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTitles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTitles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTitles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addTitle.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTitle.fulfilled, (state, action) => {
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTitle.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(addTitle.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateTitle.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteTitle.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default titlesSlice.reducer;
