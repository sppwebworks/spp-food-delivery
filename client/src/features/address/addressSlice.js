import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAddresses = createAsyncThunk(
  "address/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/addresses");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const createAddress = createAsyncThunk(
  "address/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/addresses", payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/addresses/${id}`, addressData);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        if (!s.selected && a.payload.length) {
          s.selected = a.payload.find((x) => x.isDefault) || a.payload[0];
        }
      })
      .addCase(fetchAddresses.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(createAddress.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
        s.selected = a.payload;
      })
      .addCase(updateAddress.fulfilled, (s, a) => {
        const index = s.items.findIndex((x) => x._id === a.payload._id);
        if (index !== -1) s.items[index] = a.payload;
        if (s.selected?._id === a.payload._id) s.selected = a.payload;
      })
      .addCase(deleteAddress.fulfilled, (s, a) => {
        s.items = s.items.filter((x) => x._id !== a.payload);
        if (s.selected?._id === a.payload) {
          s.selected = s.items[0] || null;
        }
      });
  },
});

export const { setSelected, clearSelected } = addressSlice.actions;
export default addressSlice.reducer;
