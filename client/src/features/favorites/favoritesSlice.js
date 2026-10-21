import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/favorites");
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggle",
  async (restaurantId, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.post(`/favorites/${restaurantId}`);
      return { restaurantId, isFavorited: data.isFavorited };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { restaurantId, isFavorited } = action.payload;

        if (!isFavorited) {
          // ✅ Removed - filter it out
          state.items = state.items.filter((r) => r._id !== restaurantId);
        } else {
          // ✅ Added - we don't have the full restaurant object here
          // The heart icon uses `isFavorited` check which is handled
          // by checking if the restaurant ID exists in the array.
          // We add a placeholder with just the _id so the heart can detect it.
          const exists = state.items.some((r) => r._id === restaurantId);
          if (!exists) {
            state.items.push({ _id: restaurantId, _placeholder: true });
          }
        }
      });
  },
});

export default favoritesSlice.reducer;
