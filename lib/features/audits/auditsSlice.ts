import { AuditDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createAudit, deleteAuditApi, fetchAudits, updateAuditApi } from "@utils/api";

interface AuditState {
  items: AuditDto[];
  loading: boolean;
  error?: string;
}

const initialState: AuditState = { items: [], loading: false };

export const fetchAuditsAsync = createAsyncThunk<AuditDto[], number>(
  'audits/fetchAll',
  async (companyId, { rejectWithValue }) => {
    try { return await fetchAudits(companyId); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const addAuditAsync = createAsyncThunk<AuditDto, AuditDto>(
  'audits/add',
  async (dto, { rejectWithValue }) => {
    try { return await createAudit(dto); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const updateAuditAsync = createAsyncThunk<AuditDto, AuditDto>(
  'audits/update',
  async (dto, { rejectWithValue }) => {
    try {
      if (!dto.id) throw new Error('Missing audit ID');
      return await updateAuditApi(dto.id, dto);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteAuditAsync = createAsyncThunk<string, string>(
  'audits/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAuditApi(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const auditsSlice = createSlice({
  name: 'audits',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAuditsAsync.pending, state => { state.loading = true; })
      .addCase(fetchAuditsAsync.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload;
      })
      .addCase(fetchAuditsAsync.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(addAuditAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAuditAsync.fulfilled, (state, action) => {
        const i = state.items.findIndex(a => a.id === action.payload.id);
        if (i >= 0) state.items[i] = action.payload;
      })
      .addCase(deleteAuditAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
      });
  }
});

export default auditsSlice.reducer;