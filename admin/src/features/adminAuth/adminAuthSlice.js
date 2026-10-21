import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { adminTokenKey } from "../../services/api";

const TOKEN_KEY = adminTokenKey;

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/login", creds);
      localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Login failed");
    }
  },
);

export const loadAdmin = createAsyncThunk(
  "adminAuth/load",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/me");
      return data;
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    loading: false,
    error: null,
    bootstrapped: false,
  },
  reducers: {
    adminLogout: (state) => {
      localStorage.removeItem(TOKEN_KEY);
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.bootstrapped = true;
      })
      .addCase(adminLogin.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(loadAdmin.fulfilled, (s, a) => {
        s.user = a.payload;
        s.bootstrapped = true;
      })
      .addCase(loadAdmin.rejected, (s) => {
        s.user = null;
        s.token = null;
        s.bootstrapped = true;
      });
  },
});

export const { adminLogout, clearAdminError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
