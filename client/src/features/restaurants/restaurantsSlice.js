/**
 * ============================================================
 * RESTAURANTS SLICE — Backend-backed, no TheMealDB
 * ============================================================
 * Normalizes cuisines to always be an array.
 * Cache-busted to avoid 304 stale responses.
 * Includes fetchMenuItemById for the item detail page.
 * ============================================================
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ---------- Normalizers ---------- */
const normalizeCuisines = (value) => {
  if (Array.isArray(value))
    return value.map((c) => String(c).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeRestaurant = (r) => ({
  ...r,
  cuisines: normalizeCuisines(r.cuisines),
});

/* ============================================================
   FETCH LIST
   ============================================================ */
export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetch",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.city) query.set("city", params.city);
      if (params.search) query.set("search", params.search);
      if (params.limit) query.set("limit", params.limit);
      query.set("_t", Date.now().toString());

      const { data } = await api.get(`/restaurants?${query.toString()}`);
      const list = (data.restaurants || []).map(normalizeRestaurant);
      console.log("[fetchRestaurants] got", list.length, "restaurants");
      return list;
    } catch (e) {
      console.error("[fetchRestaurants] error:", e);
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ============================================================
   FETCH ONE RESTAURANT (with menu)
   ============================================================ */
export const fetchRestaurantById = createAsyncThunk(
  "restaurants/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants/${id}?_t=${Date.now()}`);
      return {
        ...normalizeRestaurant(data.restaurant),
        menu: data.menu || [],
        grouped: data.grouped || {},
      };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ============================================================
   FETCH ONE MENU ITEM
   ============================================================ */
export const fetchMenuItemById = createAsyncThunk(
  "restaurants/fetchMenuItem",
  async ({ restaurantId, itemId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/restaurants/${restaurantId}/items/${itemId}?_t=${Date.now()}`,
      );
      return {
        item: data.item,
        restaurant: normalizeRestaurant(data.restaurant),
        siblings: data.siblings || [],
      };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ============================================================
   SEARCH
   ============================================================ */
export const searchMeals = createAsyncThunk(
  "restaurants/search",
  async (query, { rejectWithValue }) => {
    try {
      if (!query?.trim()) return [];
      const { data } = await api.get(
        `/restaurants?search=${encodeURIComponent(query.trim())}&_t=${Date.now()}`,
      );
      return (data.restaurants || []).map(normalizeRestaurant);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ============================================================
   CATEGORIES (derived from restaurants)
   ============================================================ */
export const fetchCategories = createAsyncThunk(
  "restaurants/categories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/restaurants?limit=200&_t=${Date.now()}`);
      const restaurants = (data.restaurants || []).map(normalizeRestaurant);

      const cuisineSet = new Set();
      restaurants.forEach((r) => {
        r.cuisines.forEach((c) => cuisineSet.add(c));
      });

      return Array.from(cuisineSet).sort((a, b) => a.localeCompare(b));
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  },
);

/* ============================================================
   SLICE
   ============================================================ */
const initialState = {
  // list
  items: [],
  categories: [],
  loading: false,
  error: null,

  // restaurant detail
  current: null,
  activeCategory: "All",

  // item detail
  menuItem: null,
  menuItemRestaurant: null,
  menuItemSiblings: [],
  menuItemLoading: false,
  menuItemError: null,
};

const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    clearCurrent: (state) => {
      state.current = null;
    },
    clearCurrentItem: (state) => {
      state.menuItem = null;
      state.menuItemRestaurant = null;
      state.menuItemSiblings = [];
      state.menuItemError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- LIST ---------- */
      .addCase(fetchRestaurants.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchRestaurants.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ---------- RESTAURANT DETAIL ---------- */
      .addCase(fetchRestaurantById.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.current = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchRestaurantById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ---------- MENU ITEM DETAIL ---------- */
      .addCase(fetchMenuItemById.pending, (s) => {
        s.menuItemLoading = true;
        s.menuItemError = null;
        s.menuItem = null;
        s.menuItemRestaurant = null;
        s.menuItemSiblings = [];
      })
      .addCase(fetchMenuItemById.fulfilled, (s, a) => {
        s.menuItemLoading = false;
        s.menuItem = a.payload.item;
        s.menuItemRestaurant = a.payload.restaurant;
        s.menuItemSiblings = a.payload.siblings;
      })
      .addCase(fetchMenuItemById.rejected, (s, a) => {
        s.menuItemLoading = false;
        s.menuItemError = a.payload;
      })

      /* ---------- SEARCH ---------- */
      .addCase(searchMeals.pending, (s) => {
        s.loading = true;
      })
      .addCase(searchMeals.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(searchMeals.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ---------- CATEGORIES ---------- */
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.categories = a.payload;
      });
  },
});

export const { setActiveCategory, clearCurrent, clearCurrentItem, clearError } =
  restaurantsSlice.actions;

export default restaurantsSlice.reducer;
