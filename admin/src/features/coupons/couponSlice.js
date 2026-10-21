import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCoupons = createAsyncThunk(
  "coupons/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/coupons");
      return data.coupons || data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

const couponSlice = createSlice({
  name: "coupons",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchCoupons.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchCoupons.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default couponSlice.reducer;
