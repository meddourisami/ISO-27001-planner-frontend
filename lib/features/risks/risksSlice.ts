import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { RiskDto } from "@/types";
import { createRisk, deleteRiskApi, listRisks, updateRiskApi } from "@utils/api";


export const fetchRisks = createAsyncThunk<RiskDto[], number>(
  'risks/fetch',
  async (companyId) => {
    return await listRisks(companyId)
  }
)

export const addRiskAsync = createAsyncThunk<RiskDto, Omit<RiskDto, 'id'>>(
  'risks/add',
  async (riskWithoutId, { rejectWithValue }) => {
    try {
      const created = await createRisk(riskWithoutId);
      return created; // Expect full RiskDto with `id`
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateRiskAsync = createAsyncThunk(
  'risks/update',
  async (risk: RiskDto) => await updateRiskApi(risk)
)

export const deleteRiskAsync = createAsyncThunk(
  'risks/delete',
  async (id: string) => {
    await deleteRiskApi(id)
    return id
  }
)

interface RisksState {
  items: RiskDto[];
  loading: boolean;
  error: string | null;
}

const initialState: RisksState = {
  items: [],
  loading: false,
  error: null,
};

const risksSlice = createSlice({
  name: 'risks',
  initialState,
  reducers: {
    // if you still need sync add/update/delete operations
  },
  extraReducers: builder =>
    builder
      .addCase(fetchRisks.pending, state => { state.loading = true; state.error = null })
      .addCase(fetchRisks.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload })
      .addCase(fetchRisks.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null })
      .addCase(addRiskAsync.fulfilled, (state, { payload }) => { state.items.push(payload) })
      .addCase(updateRiskAsync.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(r => r.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteRiskAsync.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(r => r.id !== payload);
      }),
});

export default risksSlice.reducer;