import { DocumentDto, DocumentVersionDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createDocumentWithFile, fetchDocuments, getVersionHistory, searchVersions, uploadNewVersion } from "@utils/api";

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

export const uploadDocumentVersionAsync = createAsyncThunk<void, { id: string; version: string; file: File }>(
  'documents/uploadVersion',
  async ({ id, version, file }, { rejectWithValue }) => {
    try {
      return await uploadNewVersion(id, version, file);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVersionHistoryAsync = createAsyncThunk<DocumentVersionDto[], string>(
  'documents/fetchVersions',
  async (documentId, { rejectWithValue }) => {
    try {
      return await getVersionHistory(documentId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchDocumentVersionsAsync = createAsyncThunk<DocumentVersionDto[], string>(
  'documents/searchVersions',
  async (query, { rejectWithValue }) => {
    try {
      return await searchVersions(query);
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

    builder
      .addCase(fetchVersionHistoryAsync.fulfilled, (state, action) => {
        const documentId = action.meta.arg;
        state.versions[documentId] = action.payload;
      });

    builder
      .addCase(searchDocumentVersionsAsync.fulfilled, (state, action) => {
        // Flatten or handle global version search results as needed
        console.log("Search results:", action.payload);
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;

export default documentSlice.reducer;