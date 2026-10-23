import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchMyOrders = createAsyncThunk(
  "riderOrders/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/rider/orders");
      return data.orders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  "riderOrders/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/rider/orders/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Order not found");
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "riderOrders/updateStatus",
  async ({ id, status, otp }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/rider/orders/${id}/status`, {
        status,
        otp,
      });
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  },
);

const slice = createSlice({
  name: "riderOrders",
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyOrders.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchMyOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.current = a.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const idx = s.items.findIndex((o) => o._id === a.payload._id);
        if (idx !== -1) s.items[idx] = a.payload;
        if (s.current?._id === a.payload._id) s.current = a.payload;
      });
  },
});

export default slice.reducer;
