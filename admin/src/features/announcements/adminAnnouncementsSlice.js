import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAnnouncements = createAsyncThunk(
  "adminAnnouncements/fetch",
  async () => {
    const { data } = await api.get("/announcements");
    return data;
  },
);

export const createAnnouncement = createAsyncThunk(
  "adminAnnouncements/create",
  async (payload) => {
    const { data } = await api.post("/announcements", payload);
    return data;
  },
);

export const updateAnnouncement = createAsyncThunk(
  "adminAnnouncements/update",
  async ({ id, payload }) => {
    const { data } = await api.put(`/announcements/${id}`, payload);
    return data;
  },
);

export const deleteAnnouncement = createAsyncThunk(
  "adminAnnouncements/delete",
  async (id) => {
    await api.delete(`/announcements/${id}`);
    return id;
  },
);

const adminAnnouncementsSlice = createSlice({
  name: "adminAnnouncements",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchAnnouncements.rejected, (s) => {
        s.loading = false;
      })
      .addCase(createAnnouncement.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(updateAnnouncement.fulfilled, (s, a) => {
        const idx = s.items.findIndex((i) => i._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(deleteAnnouncement.fulfilled, (s, a) => {
        s.items = s.items.filter((i) => i._id !== a.payload);
      });
  },
});

export default adminAnnouncementsSlice.reducer;
