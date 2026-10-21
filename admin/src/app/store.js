import { configureStore } from "@reduxjs/toolkit";

import adminAuthReducer from "../features/adminAuth/adminAuthSlice";
import adminOrdersReducer from "../features/orders/adminOrdersSlice";
import adminUsersReducer from "../features/users/adminUsersSlice";
import adminRestaurantsReducer from "../features/restaurants/adminRestaurantsSlice";
import adminSettingsReducer from "../features/settings/adminSettingsSlice";
import adminBannersReducer from "../features/banner/bannerSlice"; // ✅ Corrected Path
import couponsReducer from "../features/coupons/couponSlice"; // ✅ Added

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    adminOrders: adminOrdersReducer,
    adminUsers: adminUsersReducer,
    adminRestaurants: adminRestaurantsReducer,
    adminSettings: adminSettingsReducer,
    adminBanners: adminBannersReducer, // ✅ Must match useSelector in components
    coupons: couponsReducer,
  },
  devTools: true,
});
