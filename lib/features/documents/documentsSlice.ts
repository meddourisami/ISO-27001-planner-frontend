import { DocumentDto, DocumentVersionDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createDocumentWithFile, fetchDocuments, getVersionHistoryList, searchInDocuments, updateDocumentWithFile } from "@utils/api";

interface DocumentState {
  items: DocumentDto[];
  versions: Record<string, DocumentVersionDto[]>;
  loading: boolean;
  error?: string;
}

const initialState: DocumentState = {
  items: [],
  versions: {},
  loading: false,
};

// Async Thunks
export const fetchDocumentsAsync = createAsyncThunk<DocumentDto[], number>(
  'documents/fetchAll',
  async (companyId, { rejectWithValue }) => {
    try {
      return await fetchDocuments(companyId);
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
      .addCase(fetchDocumentsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocumentsAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchDocumentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder
      .addCase(createDocumentAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });

    builder.addCase(fetchVersionHistoryAsync.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(fetchVersionHistoryAsync.fulfilled, (state, action) => {
      const docId = action.meta.arg;
      state.versions[docId] = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchVersionHistoryAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder
      .addCase(searchInDocumentAsync.fulfilled, (state, action) => {
        // Flatten or handle global version search results as needed
        console.log("Search results:", action.payload);
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;

export default documentSlice.reducer;