import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchBanners = createAsyncThunk("adminBanners/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/banners");
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const createBanner = createAsyncThunk("adminBanners/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/banners", payload);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const updateBanner = createAsyncThunk("adminBanners/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/banners/" + id, payload);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const deleteBanner = createAsyncThunk("adminBanners/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete("/banners/" + id);
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

const adminBannersSlice = createSlice({
  name: "adminBanners",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (s) => { s.loading = true; })
      .addCase(fetchBanners.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchBanners.rejected, (s) => { s.loading = false; })
      .addCase(createBanner.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateBanner.fulfilled, (s, a) => {
        const idx = s.items.findIndex((i) => i._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(deleteBanner.fulfilled, (s, a) => {
        s.items = s.items.filter((i) => i._id !== a.payload);
      });
  },
});

export default adminBannersSlice.reducer;
