import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ============================================================
   THUNKS
   ============================================================ */

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, { getState, rejectWithValue }) => {
    try {
      const subtotal = getState().cart.items.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0,
      );
      const { data } = await api.post("/coupons/validate", { code, subtotal });

      const discount =
        data?.coupon?.discount ??
        data?.discount ??
        data?.coupon?.saved ??
        data?.saved ??
        data?.coupon?.amount ??
        data?.amount ??
        0;

      const discountNum = Number(discount);
      if (isNaN(discountNum) || discountNum < 0) {
        return rejectWithValue("Invalid discount returned by server");
      }

      return {
        code: data?.coupon?.code || code,
        discount: discountNum,
      };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Invalid coupon");
    }
  },
);

export const revalidateCoupon = createAsyncThunk(
  "cart/revalidateCoupon",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const coupon = state.cart.coupon;
    const items = state.cart.items;

    if (!coupon?.code) return { coupon: null, cleared: false };
    if (!items || items.length === 0) {
      return { coupon: null, cleared: true, reason: "Cart is empty" };
    }

    const subtotal = items.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0,
    );

    try {
      const { data } = await api.post("/coupons/validate", {
        code: coupon.code,
        subtotal,
      });

      const freshDiscount =
        data?.coupon?.discount ??
        data?.discount ??
        data?.coupon?.saved ??
        data?.saved ??
        data?.coupon?.amount ??
        data?.amount ??
        0;

      const discountNum = Number(freshDiscount);
      if (isNaN(discountNum) || discountNum < 0) {
        return { coupon: null, cleared: true, reason: "Invalid discount" };
      }

      return {
        coupon: {
          code: data?.coupon?.code || coupon.code,
          discount: discountNum,
        },
        cleared: false,
      };
    } catch (e) {
      return { coupon: null, cleared: true, reason: e.response?.data?.message };
    }
  },
);

/* ============================================================
   LOCAL STORAGE HELPERS
   ============================================================ */

const loadCartFromStorage = () => {
  try {
    const serialized = localStorage.getItem("cart");
    if (serialized === null)
      return { items: [], coupon: null, restaurant: null };
    const parsed = JSON.parse(serialized);

    const validItems = Array.isArray(parsed.items)
      ? parsed.items.filter(
          (item) =>
            item &&
            item.id &&
            typeof item.price === "number" &&
            item.quantity > 0,
        )
      : [];

    const validCoupon =
      parsed.coupon && parsed.coupon.code
        ? {
            code: parsed.coupon.code,
            discount: Number(parsed.coupon.discount) || 0,
          }
        : null;

    return {
      items: validItems,
      coupon: validCoupon,
      restaurant: parsed.restaurant || null,
    };
  } catch (err) {
    return { items: [], coupon: null, restaurant: null };
  }
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items: state.items,
        coupon: state.coupon,
        restaurant: state.restaurant,
      }),
    );
  } catch (err) {
    // ignore
  }
};

/* ============================================================
   SLICE
   ============================================================ */

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      if (!payload || !payload.id) return;
      const payloadId = String(payload.id);
      const existing = state.items.find(
        (item) => String(item.id) === payloadId,
      );

      if (existing) {
        existing.quantity = (Number(existing.quantity) || 0) + 1;
      } else {
        state.items.push({
          id: payloadId,
          name: payload.name || "Unknown item",
          price: Number(payload.price) || 0,
          image: payload.image || "",
          restaurant: payload.restaurant || "",
          restaurantName: payload.restaurantName || "",
          quantity: 1,
        });
        // If restaurant changed, update cart restaurant
        if (!state.restaurant && payload.restaurant) {
          state.restaurant = {
            _id: payload.restaurant,
            name: payload.restaurantName,
          };
        }
      }
      saveCartToStorage(state);
    },
    removeFromCart: (state, action) => {
      const id = String(action.payload);
      const existing = state.items.find((item) => String(item.id) === id);
      if (existing) {
        if (existing.quantity > 1) existing.quantity -= 1;
        else state.items = state.items.filter((item) => String(item.id) !== id);
      }
      // If cart is empty, clear restaurant too
      if (state.items.length === 0) state.restaurant = null;
      saveCartToStorage(state);
    },
    removeItemCompletely: (state, action) => {
      const id = String(action.payload);
      state.items = state.items.filter((item) => String(item.id) !== id);
      if (state.items.length === 0) state.restaurant = null;
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.restaurant = null;
      saveCartToStorage(state);
    },
    clearCoupon: (state) => {
      state.coupon = null;
      saveCartToStorage(state);
    },
    // ✅ NEW: Replace entire cart (used by Reorder)
    replaceCart: (state, action) => {
      const { restaurant, items } = action.payload;
      state.restaurant = restaurant;
      state.items = items;
      state.coupon = null; // Reset coupon
      saveCartToStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.fulfilled, (s, a) => {
        s.coupon = a.payload;
        saveCartToStorage(s);
      })
      .addCase(applyCoupon.rejected, (s) => {
        s.coupon = null;
        saveCartToStorage(s);
      })
      .addCase(revalidateCoupon.fulfilled, (s, a) => {
        s.coupon = a.payload.coupon;
        saveCartToStorage(s);
      })
      .addCase(revalidateCoupon.rejected, (s) => {
        s.coupon = null;
        saveCartToStorage(s);
      });
  },
});

/* ============================================================
   ACTIONS + ALIASES
   ============================================================ */
export const {
  addToCart,
  removeFromCart,
  removeItemCompletely,
  clearCart,
  clearCoupon,
  replaceCart, // ✅ Added
} = cartSlice.actions;

export const decrementItem = removeFromCart;
export const incrementItem = addToCart;
export const removeItem = removeFromCart;
export const removeCoupon = clearCoupon;
export const incrementQuantity = addToCart;
export const decrementQuantity = removeFromCart;
export const deleteItem = removeFromCart;
export const clear = clearCart;
export const resetCart = clearCart;

export const updateQuantity = (id, quantity) => (dispatch, getState) => {
  const item = getState().cart.items.find((i) => String(i.id) === String(id));
  if (!item) return;
  const diff = quantity - item.quantity;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      dispatch(
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          restaurant: item.restaurant,
          restaurantName: item.restaurantName,
        }),
      );
    }
  } else if (diff < 0) {
    for (let i = 0; i < Math.abs(diff); i++) {
      dispatch(removeFromCart(id));
    }
  }
};

export default cartSlice.reducer;

/* ============================================================
   SELECTORS
   ============================================================ */
export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => {
    const price = Number(i.price) || 0;
    const qty = Number(i.quantity) || 0;
    return sum + price * qty;
  }, 0);

export const selectDiscount = (state) => {
  const disc = Number(state.cart.coupon?.discount) || 0;
  return isNaN(disc) ? 0 : disc;
};

export const selectDeliveryFee = (state) => {
  if (state.cart.items.length === 0) return 0;
  const subtotal = selectCartSubtotal(state);
  const threshold = state.settings?.freeDeliveryThreshold ?? 499;
  if (subtotal >= threshold) return 0;
  return Number(state.settings?.deliveryFee) || 30;
};

export const selectPackagingFee = (state) => {
  if (state.cart.items.length === 0) return 0;
  return Number(state.settings?.packagingFee) || 10;
};

export const selectTax = (state) => {
  const subtotal = selectCartSubtotal(state);
  const taxPercent = Number(state.settings?.taxRate) || 5;
  const tax = Math.round(subtotal * (taxPercent / 100));
  return isNaN(tax) ? 0 : tax;
};

export const selectMinOrderValue = (state) => {
  const min = Number(state.settings?.minOrderValue);
  return isNaN(min) ? 199 : min;
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectDiscount(state);
  const delivery = selectDeliveryFee(state);
  const packaging = selectPackagingFee(state);
  const tax = selectTax(state);
  const total = Math.max(0, subtotal - discount + delivery + packaging + tax);
  return isNaN(total) ? 0 : total;
};
