/**
 * ============================================================
 * ORDERS SLICE
 * ============================================================
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ============================================================
   THUNKS
   ============================================================ */

/* ---------- FETCH MY ORDERS (paginated) ---------- */
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (
    { page = 1, limit = 10, archived = false } = {},
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/orders?page=${page}&limit=${limit}&archived=${archived}&_t=${Date.now()}`,
      );
      return {
        orders: Array.isArray(data) ? data : data.orders || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        pages: data.pages || 1,
        archived,
      };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

export const fetchMyOrders = fetchOrders;

/* ---------- FETCH ONE ORDER ---------- */
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${id}?_t=${Date.now()}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ---------- CREATE ORDER ---------- */
export const createOrder = createAsyncThunk(
  "orders/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders", payload);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to place order",
      );
    }
  },
);

/* ---------- CANCEL ORDER ---------- */
export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to cancel order",
      );
    }
  },
);

/* ---------- ARCHIVE ORDER ---------- */
export const archiveOrder = createAsyncThunk(
  "orders/archive",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}/archive`);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to archive order",
      );
    }
  },
);

/* ---------- UNARCHIVE ORDER ---------- */
export const unarchiveOrder = createAsyncThunk(
  "orders/unarchive",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${id}/unarchive`);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to restore order",
      );
    }
  },
);

/* ---------- REORDER ---------- */
export const reorderOrder = createAsyncThunk(
  "orders/reorder",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/reorder`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to reorder");
    }
  },
);

/* ============================================================
   SLICE
   ============================================================ */
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loaded: false,
    current: null,
    loading: false,
    error: null,
    // Pagination state
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    archived: false,
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.current = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.current = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.items.find((o) => o._id === orderId);
      if (order) order.status = status;
      if (state.current?._id === orderId) state.current.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH LIST */
      .addCase(fetchOrders.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.items = a.payload.orders;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.limit = a.payload.limit;
        s.pages = a.payload.pages;
        s.archived = a.payload.archived;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.error = a.payload;
      })

      /* FETCH ONE */
      .addCase(fetchOrderById.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.current = null;
      })
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchOrderById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* CREATE */
      .addCase(createOrder.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createOrder.fulfilled, (s, a) => {
        s.loading = false;
        s.items.unshift(a.payload);
        s.current = a.payload;
        s.loaded = true;
      })
      .addCase(createOrder.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* CANCEL */
      .addCase(cancelOrder.pending, (s) => {
        s.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (s, a) => {
        s.loading = false;
        const updatedOrder = a.payload.order || a.payload;
        const idx = s.items.findIndex((o) => o._id === updatedOrder._id);
        if (idx !== -1) s.items[idx] = updatedOrder;
        if (s.current?._id === updatedOrder._id) {
          s.current = updatedOrder;
        }
      })
      .addCase(cancelOrder.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ARCHIVE */
      .addCase(archiveOrder.fulfilled, (s, a) => {
        const order = a.payload.order || a.payload;
        s.items = s.items.filter((o) => o._id !== order._id);
        s.total = Math.max(0, s.total - 1);
      })

      /* UNARCHIVE */
      .addCase(unarchiveOrder.fulfilled, (s, a) => {
        const order = a.payload.order || a.payload;
        s.items = s.items.filter((o) => o._id !== order._id);
        s.total = Math.max(0, s.total - 1);
      });
  },
});

export const { setCurrentOrder, clearCurrentOrder, updateOrderStatus } =
  ordersSlice.actions;

export default ordersSlice.reducer;
