import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchControlsByCompany, updateControlStatusBackend } from "@utils/api";

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

export const updateControlStatusAsync = createAsyncThunk<
  { id: string; status: string; evidence: string },
  { id: string; status: string; evidence: string },
  { rejectValue: string }
>(
  'compliance/updateControlStatus',
  async ({ id, status, evidence }, { rejectWithValue }) => {
    try {
      await updateControlStatusBackend(id, { status, evidence });
      return { id, status, evidence };
    } catch (e: any) {
      return rejectWithValue(e.message);
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
        const c = state.controls.find(ctrl => ctrl.id === action.payload.id);
        if (c) {
          c.status = action.payload.status;
          c.evidence = action.payload.evidence;
          c.lastReview = new Date().toISOString().split("T")[0];
        }
      })
      .addCase(updateControlStatusAsync.rejected, (state, action) => {
        state.error = action.payload || 'Control update failed';
      });
  }
});

export default complianceSlice.reducer;