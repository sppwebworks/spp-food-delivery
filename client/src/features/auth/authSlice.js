/**
 * ============================================================
 * AUTH SLICE
 * ============================================================
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ---------- THUNKS ---------- */

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("token", data.token);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      localStorage.setItem("token", data.token);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      // ✅ IMPORTANT: If your backend returns { user: {...} } instead of just the user,
      // change this to `return data.user;`
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Not authenticated");
    }
  },
);

/* ---------- INITIAL STATE ---------- */

const storedToken = localStorage.getItem("token");

const initialState = {
  user: null,
  token: storedToken || null,
  authLoaded: !storedToken,
  loading: false,
  error: null,
};

/* ---------- SLICE ---------- */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.authLoaded = true;
      state.error = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user || a.payload;
        s.token = a.payload.token;
        s.authLoaded = true;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user || a.payload;
        s.token = a.payload.token;
        s.authLoaded = true;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(loadUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loadUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        s.authLoaded = true;
      })
      .addCase(loadUser.rejected, (s) => {
        s.loading = false;
        s.user = null;
        s.token = null;
        s.authLoaded = true;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
