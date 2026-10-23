import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const login = createAsyncThunk(
  "riderAuth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("riderToken", data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const loadRider = createAsyncThunk(
  "riderAuth/load",
  async (_, { rejectWithValue }) => {
    try {
      const { data: user } = await api.get("/auth/me");
      const { data: rider } = await api.get("/rider/me");
      return { user, rider };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load rider",
      );
    }
  },
);

const slice = createSlice({
  name: "riderAuth",
  initialState: {
    token: localStorage.getItem("riderToken") || null,
    user: null,
    rider: null,
    loading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("riderToken");
      state.token = null;
      state.user = null;
      state.rider = null;
      state.loaded = false;
    },
    updateRiderLocal: (state, action) => {
      state.rider = { ...state.rider, ...action.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(loadRider.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadRider.fulfilled, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.user = a.payload.user;
        s.rider = a.payload.rider;
      })
      .addCase(loadRider.rejected, (s, a) => {
        s.loading = false;
        s.loaded = true;
        s.error = a.payload;
      });
  },
});

export const { logout, updateRiderLocal } = slice.actions;
export default slice.reducer;
