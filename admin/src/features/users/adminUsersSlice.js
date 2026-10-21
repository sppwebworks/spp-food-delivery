import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (s, a) => {
        s.loading = false;
        // ✅ FIX: Handle both array or { users: [] } object responses
        s.items = Array.isArray(a.payload) ? a.payload : a.payload?.users || [];
      })
      .addCase(fetchAdminUsers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default adminUsersSlice.reducer;
