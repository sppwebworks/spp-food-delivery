import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ---------- FETCH ALL ---------- */
export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams(params).toString();
      const { data } = await api.get(`/admin/orders${q ? `?${q}` : ""}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

/* ---------- FETCH ONE ---------- */
export const fetchAdminOrder = createAsyncThunk(
  "adminOrders/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

/* ---------- UPDATE STATUS ---------- */
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status });

      // Backend may return either raw order OR { order: {...} }
      const order = data?.order ? data.order : data;

      // If somehow we got no order back, return a minimal patch
      if (!order?._id) {
        return { _id: id, status };
      }

      return order;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Update failed");
    }
  },
);

/* ---------- SLICE ---------- */
const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState: {
    items: [],
    current: null,
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    updating: {}, // { [orderId]: true } — per-row saving flag
    error: null,
  },
  reducers: {
    clearCurrentOrder: (s) => {
      s.current = null;
    },
    // ✅ NEW: Real-time socket updates
    orderCreatedRealtime: (state, action) => {
      // If the current view is filtered by a specific status (e.g. "delivered"),
      // and the new order is "pending", we don't want to inject it into the list.
      // The easiest way is to let the component re-fetch, or just prepend it.
      // We'll prepend it for instant feedback if it matches or no filter.
      const newOrder = action.payload;
      if (newOrder && newOrder._id) {
        // Only add to list if not already there
        if (!state.items.find((o) => o._id === newOrder._id)) {
          state.items.unshift(newOrder);
          state.total += 1;
        }
      }
    },
    orderStatusRealtime: (state, action) => {
      const { orderId, status } = action.payload;
      const index = state.items.findIndex((o) => o._id === orderId);
      if (index !== -1) {
        state.items[index].status = status;
      }
      if (state.current && state.current._id === orderId) {
        state.current.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- FETCH ALL ----------
      .addCase(fetchAdminOrders.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.orders || a.payload || [];
        s.total = a.payload.total || s.items.length;
        s.page = a.payload.page || 1;
        s.pages = a.payload.pages || 1;
      })
      .addCase(fetchAdminOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---------- FETCH ONE ----------
      .addCase(fetchAdminOrder.pending, (s) => {
        s.error = null;
      })
      .addCase(fetchAdminOrder.fulfilled, (s, a) => {
        s.current = a.payload.order || a.payload;
      })
      .addCase(fetchAdminOrder.rejected, (s, a) => {
        s.error = a.payload;
      })

      // ---------- UPDATE STATUS ----------
      .addCase(updateOrderStatus.pending, (s, a) => {
        const id = String(a.meta.arg.id);
        s.updating[id] = true;
        s.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const id = String(a.meta.arg.id);
        delete s.updating[id];

        const updated = a.payload || {};

        // Update the list item (merge, don't replace — preserves populated user)
        const i = s.items.findIndex((o) => String(o._id) === id);
        if (i !== -1) {
          s.items[i] = { ...s.items[i], ...updated, _id: id };
        }

        // Update current order if it's the same
        if (s.current && String(s.current._id) === id) {
          s.current = { ...s.current, ...updated, _id: id };
        }
      })
      .addCase(updateOrderStatus.rejected, (s, a) => {
        const id = String(a.meta.arg.id);
        delete s.updating[id];
        s.error = a.payload;
      });
  },
});

export const { clearCurrentOrder, orderCreatedRealtime, orderStatusRealtime } =
  adminOrdersSlice.actions;

export default adminOrdersSlice.reducer;
