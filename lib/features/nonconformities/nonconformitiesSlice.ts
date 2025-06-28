import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { NonConformityDto } from "@/types";
import { createNonConformity, deleteNonConformityApi, fetchNonConformities, updateNonConformityApi } from "@utils/api";

export const fetchNonConformitiesAsync = createAsyncThunk<
  NonConformityDto[],
  number,
  { rejectValue: string }
>('nonconformities/fetch', async (companyId, { rejectWithValue }) => {
  try { return await fetchNonConformities(companyId); }
  catch (e: any) { return rejectWithValue(e.message); }
});

export const addNonConformityAsync = createAsyncThunk<
  NonConformityDto,
  NonConformityDto,
  { rejectValue: string }
>('nonconformities/add', async (dto, { rejectWithValue }) => {
  try { return await createNonConformity(dto); }
  catch (e: any) { return rejectWithValue(e.message); }
});

export const updateNonConformityAsync = createAsyncThunk<
  NonConformityDto,
  NonConformityDto,
  { rejectValue: string }
>('nonconformities/update', async (dto, { rejectWithValue }) => {
  try {
    const { id, ...dataWithoutId } = dto;
    const trimmedId = id?.trim();
    return await updateNonConformityApi(trimmedId!, dataWithoutId as Omit<NonConformityDto, 'id'>);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const deleteNonConformityAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('nonconformities/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteNonConformityApi(id);
    return id;
  } catch (e: any) { return rejectWithValue(e.message); }
});

// Initial state
interface NonConformitiesState {
  items: NonConformityDto[];
  loading: boolean;
  error?: string;
}

const initialState: NonConformitiesState = {
  items: [],
  loading: false,
};

export const nonconformitiesSlice = createSlice({
  name: 'nonconformities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNonConformitiesAsync.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(fetchNonConformitiesAsync.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchNonConformitiesAsync.rejected, (s, a) => { s.loading = false; s.error = a.payload })

      .addCase(addNonConformityAsync.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(updateNonConformityAsync.fulfilled, (s, a) => {
        const index = s.items.findIndex(i => i.id === a.payload.id);
        if (index !== -1) s.items[index] = a.payload;
      })
      .addCase(deleteNonConformityAsync.fulfilled, (s, a) => {
        s.items = s.items.filter(i => i.id !== a.payload);
      });
  },
});

export default nonconformitiesSlice.reducer;