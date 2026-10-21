import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/settings?_t=${Date.now()}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettings: (s) => {
      s.data = null;
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchSettings.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchSettings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
