import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAdminSettings = createAsyncThunk(
  "adminSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/settings");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

export const updateAdminSettings = createAsyncThunk(
  "adminSettings/update",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/admin/settings", payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

const initialState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const adminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSettings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAdminSettings.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchAdminSettings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(updateAdminSettings.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateAdminSettings.fulfilled, (s, a) => {
        s.saving = false;
        s.data = a.payload;
      })
      .addCase(updateAdminSettings.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      });
  },
});

export default adminSettingsSlice.reducer;
