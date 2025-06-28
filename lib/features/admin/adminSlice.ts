import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BackendUser } from "@/types";
import { createAdmin, deleteAdmin, fetchAdmins, updateAdmin } from "@utils/api";

export const fetchAdminsAsync = createAsyncThunk<BackendUser[]>(
  'admin/fetchAdmins',
  async () => await fetchAdmins()
);

export const createAdminAsync = createAsyncThunk<BackendUser, Omit<BackendUser, 'id'>>(
  'admin/createAdmin',
  async (dto, { rejectWithValue }) => {
    try {
      return await createAdmin(dto);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateAdminAsync = createAsyncThunk<BackendUser, BackendUser>(
  'admin/updateAdmin',
  async (dto, { rejectWithValue }) => {
    const { id, ...rest } = dto;
    try {
      return await updateAdmin(id!, rest);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteAdminAsync = createAsyncThunk<string, string>(
  'admin/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdmin(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

interface AdminState {
  items: BackendUser[];
  loading: boolean;
  error?: string;
}

const initialState: AdminState = {
  items: [],
  loading: false,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAdminsAsync.pending, state => { state.loading = true; })
      .addCase(fetchAdminsAsync.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchAdminsAsync.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createAdminAsync.fulfilled, (state, { payload }) => {
        state.items.push(payload);
      })
      .addCase(updateAdminAsync.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(u => u.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteAdminAsync.fulfilled, (state, { payload: id }) => {
        state.items = state.items.filter(u => u.id !== id);
      });
  }
});

export default adminSlice.reducer;