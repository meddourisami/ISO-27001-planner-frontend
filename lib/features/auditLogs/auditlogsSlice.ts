import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAuditLogs } from '@/utils/api';
import { AuditLog } from '@/types';

interface AuditLogsState {
  items: AuditLog[];
  loading: boolean;
  error?: string;
}

const initialState: AuditLogsState = { items: [], loading: false };

export const fetchAuditLogsAsync = createAsyncThunk<AuditLog[], void>(
  'audit/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAuditLogs();
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const auditLogsSlice = createSlice({
  name: 'auditlogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogsAsync.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAuditLogsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAuditLogsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default auditLogsSlice.reducer;