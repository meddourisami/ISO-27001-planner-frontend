import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BackendUser } from "@/types";
import { createAdmin, deleteAdminApi, fetchAdmins, updateAdmin } from "@utils/api";

export interface AdminUserCreationRequest {
  email: string;
  password: string;
  companyName: string;
  scope: string;
}

export const fetchAdminsAsync = createAsyncThunk<BackendUser[]>(
  'admin/fetchAdmins',
  async () => await fetchAdmins()
);

export const addAdminUserAsync = createAsyncThunk<
  string, // because the response is a string
  AdminUserCreationRequest,
  { rejectValue: string }
>('admin/add', async (dto, { rejectWithValue }) => {
  try {
    return await createAdmin(dto);
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to create admin");
  }
});

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

export const deleteAdminAsync = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteAdmin',
  async (email, { rejectWithValue }) => {
    try {
      return await deleteAdminApi(email);
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
      .addCase(addAdminUserAsync.fulfilled, (state, { payload }) => {
        //state.items.push(payload);
      })
      .addCase(updateAdminAsync.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(u => u.id === payload.id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteAdminAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(user => user.email !== action.meta.arg);
      })
      .addCase(deleteAdminAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default adminSlice.reducer;