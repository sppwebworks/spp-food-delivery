import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchActiveAnnouncement = createAsyncThunk(
  "announcements/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/announcements/active");
      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const announcementsSlice = createSlice({
  name: "announcements",
  initialState: { data: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveAnnouncement.fulfilled, (s, a) => {
        s.data = a.payload;
      })
      .addCase(fetchActiveAnnouncement.rejected, (s) => {
        s.data = null;
      });
  },
});
export default announcementsSlice.reducer;
