import { DocumentDto, DocumentVersionDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { approveDocumentApi, createDocumentWithFile, fetchCompanyDocuments, getVersionHistoryList, PaginatedResponse, searchInDocuments, updateDocumentWithFile } from "@utils/api";

interface DocumentState {
  items: DocumentDto[];
  versions: Record<string, DocumentVersionDto[]>;
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error?: string;
}

const initialState: DocumentState = {
  items: [],
  versions: {},
  page: 0,
  totalPages: 0,
  totalElements: 0,
  loading: false,
};

// Async Thunks

export const fetchDocumentsPageAsync = createAsyncThunk<
  PaginatedResponse<DocumentDto>,
  {
    companyId: number;
    page: number;
    size: number;
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  { rejectValue: string }
>(
  'documents/fetchPage',
  async (args, { rejectWithValue }) => {
    try {
      return await fetchCompanyDocuments(
        args.companyId,
        args.page,
        args.size,
        args.search,
        args.type,
        args.sortBy,
        args.sortOrder
      );
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createDocumentAsync = createAsyncThunk<DocumentDto, { dto: DocumentDto; file: File }>(
  'documents/create',
  async ({ dto, file }, { rejectWithValue }) => {
    try {
      return await createDocumentWithFile(dto, file);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDocumentAsync = createAsyncThunk<
  string,
  { id: string; dto: Omit<DocumentDto, "id">; file?: File }
>("documents/update", async ({ id, dto, file }, { rejectWithValue }) => {
  try {
    const fullDto: DocumentDto = { ...dto, id };
    return await updateDocumentWithFile(id, fullDto, file);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchVersionHistoryAsync = createAsyncThunk<DocumentVersionDto[], string>(
  'documents/fetchVersions',
  async (documentId, { rejectWithValue }) => {
    try {
      return await getVersionHistoryList(documentId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchInDocumentAsync = createAsyncThunk<DocumentVersionDto[], string>(
  'documents/searchVersions',
  async (query, { rejectWithValue }) => {
    try {
      return await searchInDocuments(query);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveDocumentAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'documents/approve',
  async (id, { rejectWithValue }) => {
    try {
      return await approveDocumentApi(id);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// Slice definition
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentsPageAsync.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(fetchDocumentsPageAsync.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.items = payload.content;
        s.totalPages = payload.totalPages;
        s.totalElements = payload.totalElements;
        s.page = payload.number;
      })
      .addCase(fetchDocumentsPageAsync.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(createDocumentAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(fetchVersionHistoryAsync.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchVersionHistoryAsync.fulfilled, (state, action) => {
        const docId = action.meta.arg;
        state.versions[docId] = action.payload;
        state.loading = false;
      })
      .addCase(fetchVersionHistoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchInDocumentAsync.fulfilled, (state, action) => {
        // Flatten or handle global version search results as needed
        console.log("Search results:", action.payload);
      })
      .addCase(approveDocumentAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveDocumentAsync.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(approveDocumentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;

export default documentSlice.reducer;