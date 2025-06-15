import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchControlsByCompany, updateControlStatusApi } from "@utils/api";

export const fetchControlsAsync = createAsyncThunk(
  'compliance/fetchControls',
  async (companyId: number, { rejectWithValue }) => {
    try {
      return await fetchControlsByCompany(companyId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch controls');
    }
  }
);

export const updateControlStatusAsync = createAsyncThunk(
  'compliance/updateControlStatus',
  async (
    payload: { id: string; status: string; evidence: string; companyId: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateControlStatusApi(payload.id, payload.status, payload.evidence);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update control');
    }
  }
);

interface Control {
  id: string;
  title: string;
  description: string;
  status: string;
  evidence: string;
  lastReview: string;
}

interface ComplianceState {
  controls: Control[];
  loading: boolean;
  error: string | null;
}

const initialState: ComplianceState = { controls: [], loading: false, error: null };

export const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchControlsAsync.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchControlsAsync.fulfilled, (state, action: PayloadAction<Control[]>) => {
        state.controls = action.payload;
        state.loading = false;
      })
      .addCase(fetchControlsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateControlStatusAsync.fulfilled, (state, action) => {
        const idx = state.controls.findIndex(c => c.id === action.payload.id);
        if (idx > -1) state.controls[idx] = action.payload;
      })
      .addCase(updateControlStatusAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

export default complianceSlice.reducer;