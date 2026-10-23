import { configureStore } from "@reduxjs/toolkit";
import riderAuthReducer from "./features/auth/riderAuthSlice";
import riderOrdersReducer from "./features/orders/riderOrdersSlice";

export const store = configureStore({
  reducer: {
    riderAuth: riderAuthReducer,
    riderOrders: riderOrdersReducer,
  },
});
