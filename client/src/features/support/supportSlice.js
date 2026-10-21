/**
 * ============================================================
 * SUPPORT SLICE
 * ============================================================
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const createTicket = createAsyncThunk(
  "support/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/support", payload);
      return data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to create ticket",
      );
    }
  },
);

export const fetchMyTickets = createAsyncThunk(
  "support/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/support/mine");
      return data.tickets;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to fetch tickets",
      );
    }
  },
);

export const fetchTicketById = createAsyncThunk(
  "support/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/support/${id}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Ticket not found");
    }
  },
);

export const replyToTicket = createAsyncThunk(
  "support/reply",
  async ({ id, message }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/support/${id}/reply`, { message });
      return data.ticket;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to reply");
    }
  },
);

const supportSlice = createSlice({
  name: "support",
  initialState: {
    tickets: [],
    current: null,
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearCurrentTicket: (s) => {
      s.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (s) => {
        s.submitting = true;
        s.error = null;
      })
      .addCase(createTicket.fulfilled, (s, a) => {
        s.submitting = false;
        s.tickets.unshift(a.payload.ticket);
      })
      .addCase(createTicket.rejected, (s, a) => {
        s.submitting = false;
        s.error = a.payload;
      })

      .addCase(fetchMyTickets.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyTickets.fulfilled, (s, a) => {
        s.loading = false;
        s.tickets = a.payload;
      })
      .addCase(fetchMyTickets.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchTicketById.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchTicketById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchTicketById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(replyToTicket.fulfilled, (s, a) => {
        s.current = a.payload;
      });
  },
});

export const { clearCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;
