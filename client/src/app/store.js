import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import ordersReducer from "../features/orders/ordersSlice";
import addressReducer from "../features/address/addressSlice";
import restaurantsReducer from "../features/restaurants/restaurantsSlice";
import uiReducer from "../features/ui/uiSlice";
import settingsReducer from "../features/settings/settingsSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import bannerReducer from "../features/banner/bannerSlice";
import supportReducer from "../features/support/supportSlice"; // ✅ ADDED

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    address: addressReducer,
    restaurants: restaurantsReducer,
    ui: uiReducer,
    settings: settingsReducer,
    favorites: favoritesReducer,
    banner: bannerReducer,
    support: supportReducer, // ✅ ADDED
  },
  devTools: true,
});
