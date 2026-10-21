import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/**
 * ============================================================
 * BANNER SLICE — CUSTOMER APP
 * ============================================================
 * Fetches the active top + hero banners from the public
 * /api/banners/active endpoint. No auth required.
 * ============================================================
 */

export const fetchActiveBanners = createAsyncThunk(
  "banner/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/banners/active");
      return data; // { top: {...}, hero: {...} }
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    top: null,
    hero: null,
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBanners.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchActiveBanners.fulfilled, (s, a) => {
        s.loading = false;
        s.top = a.payload.top;
        s.hero = a.payload.hero;
      })
      .addCase(fetchActiveBanners.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default bannerSlice.reducer;
