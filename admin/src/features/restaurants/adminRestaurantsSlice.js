import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ============================================================
   RESTAURANTS
   ============================================================ */

export const fetchRestaurants = createAsyncThunk(
  "adminRestaurants/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/restaurants");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const fetchRestaurantById = createAsyncThunk(
  "adminRestaurants/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const createRestaurant = createAsyncThunk(
  "adminRestaurants/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/restaurants", payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const updateRestaurant = createAsyncThunk(
  "adminRestaurants/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/restaurants/${id}`, payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const deleteRestaurant = createAsyncThunk(
  "adminRestaurants/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/restaurants/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const toggleRestaurant = createAsyncThunk(
  "adminRestaurants/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/restaurants/${id}/toggle`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

/* ============================================================
   MENU ITEMS
   ============================================================ */

export const createMenuItem = createAsyncThunk(
  "adminRestaurants/createItem",
  async ({ restaurantId, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/admin/restaurants/${restaurantId}/items`,
        payload,
      );
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const updateMenuItem = createAsyncThunk(
  "adminRestaurants/updateItem",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/items/${id}`, payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const deleteMenuItem = createAsyncThunk(
  "adminRestaurants/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/items/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const toggleMenuItem = createAsyncThunk(
  "adminRestaurants/toggleItem",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/items/${id}/toggle`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

/* ============================================================
   SLICE
   ============================================================ */

const adminRestaurantsSlice = createSlice({
  name: "adminRestaurants",
  initialState: {
    items: [],
    current: null,
    total: 0,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearCurrent: (s) => {
      s.current = null;
    },
    clearError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH ALL ---------- */
      .addCase(fetchRestaurants.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.restaurants || [];
        s.total = a.payload.total || 0;
      })
      .addCase(fetchRestaurants.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ---------- FETCH ONE ---------- */
      .addCase(fetchRestaurantById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchRestaurantById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createRestaurant.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(createRestaurant.fulfilled, (s, a) => {
        s.saving = false;
        s.items.unshift({ ...a.payload, itemCount: 0 });
        s.total += 1;
      })
      .addCase(createRestaurant.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateRestaurant.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.items.findIndex((r) => r._id === a.payload._id);
        if (i !== -1) s.items[i] = { ...s.items[i], ...a.payload };
      })
      .addCase(updateRestaurant.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteRestaurant.fulfilled, (s, a) => {
        s.items = s.items.filter((r) => r._id !== a.payload);
        s.total = Math.max(0, s.total - 1);
      })

      /* ---------- TOGGLE RESTAURANT ---------- */
      .addCase(toggleRestaurant.fulfilled, (s, a) => {
        const i = s.items.findIndex((r) => r._id === a.payload._id);
        if (i !== -1) s.items[i] = { ...s.items[i], ...a.payload };
      })

      /* ---------- MENU: CREATE ---------- */
      .addCase(createMenuItem.fulfilled, (s, a) => {
        s.saving = false;
        if (!s.current) return;

        const item = a.payload;
        const cat = item.category || "Recommended";

        if (!s.current.grouped) s.current.grouped = {};
        if (!s.current.grouped[cat]) s.current.grouped[cat] = [];
        s.current.grouped[cat].push(item);

        if (!s.current.menu) s.current.menu = [];
        s.current.menu.push(item);

        // Increment item count in the restaurant list
        const r = s.items.find((x) => x._id === s.current._id);
        if (r) r.itemCount = (r.itemCount || 0) + 1;
      })

      /* ---------- MENU: UPDATE ---------- */
      .addCase(updateMenuItem.fulfilled, (s, a) => {
        if (!s.current?.grouped) return;
        const updated = a.payload;

        // Find the item across all categories
        Object.keys(s.current.grouped).forEach((cat) => {
          s.current.grouped[cat] = s.current.grouped[cat].map((it) =>
            it._id === updated._id ? updated : it,
          );
        });
      })

      /* ---------- MENU: DELETE ---------- */
      .addCase(deleteMenuItem.fulfilled, (s, a) => {
        if (!s.current?.grouped) return;
        const id = a.payload;

        Object.keys(s.current.grouped).forEach((cat) => {
          s.current.grouped[cat] = s.current.grouped[cat].filter(
            (it) => it._id !== id,
          );
          if (s.current.grouped[cat].length === 0) {
            delete s.current.grouped[cat];
          }
        });

        // Decrement item count in the list
        const r = s.items.find((x) => x._id === s.current._id);
        if (r) r.itemCount = Math.max(0, (r.itemCount || 0) - 1);
      })

      /* ---------- MENU: TOGGLE ---------- */
      .addCase(toggleMenuItem.fulfilled, (s, a) => {
        if (!s.current?.grouped) return;
        const updated = a.payload;

        Object.keys(s.current.grouped).forEach((cat) => {
          s.current.grouped[cat] = s.current.grouped[cat].map((it) =>
            it._id === updated._id ? updated : it,
          );
        });
      });
  },
});

export const { clearCurrent, clearError } = adminRestaurantsSlice.actions;
export default adminRestaurantsSlice.reducer;
