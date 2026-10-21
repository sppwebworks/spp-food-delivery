/**
 * ============================================================
 * UI SLICE
 * ============================================================
 *
 * Small, transient UI state that doesn't belong in a domain slice.
 *
 * State:
 *   cartOpen      → bool (mobile drawer)
 *   searchQuery   → string (live search input)
 *   mobileMenuOpen → bool
 * ============================================================
 */

import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    cartOpen: false,
    searchQuery: "",
    mobileMenuOpen: false,
  },
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = "";
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  setSearchQuery,
  clearSearchQuery,
  toggleMobileMenu,
  closeMobileMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
