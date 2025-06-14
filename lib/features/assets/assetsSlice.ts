import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { AssetDto } from "@/types"
import { RootState } from "@/lib/store"
import { createAsset, deleteAssetApi, getAssetById, listAssets, updateAssetApi } from "@utils/api"

export interface AssetsState {
  items: AssetDto[]
  loading: boolean
  error: string | null
}

const initialState: AssetsState = {
  items: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchAssets = createAsyncThunk("assets/fetch", async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState
  const companyId = state.auth.user?.companyId
  if (!companyId) return thunkAPI.rejectWithValue("No company ID")
  return await listAssets(companyId)
})

export const addAssetAsync = createAsyncThunk<
  AssetDto,       // return type from thunk
  Omit<AssetDto, "id">, // input payload without id
  { rejectValue: string }
>("assets/add", async (asset, thunkAPI) => {
  const state = thunkAPI.getState() as RootState
  const companyId = state.auth.user?.companyId
  if (!companyId) {
    return thunkAPI.rejectWithValue("No company ID")
  }

  // Create full payload for backend (backend will generate id)
  const dto: Omit<AssetDto, "id"> = { ...asset, companyId }

  return await createAsset(dto) // returns full AssetDto
})

export const updateAssetAsync = createAsyncThunk("assets/update", async (asset: AssetDto) => {
  return await updateAssetApi(asset.id, asset)
})

export const deleteAssetAsync = createAsyncThunk("assets/delete", async (id: string) => {
  await deleteAssetApi(id)
  return id
})

export const addRiskToAsset = createAsyncThunk<
  AssetDto,
  { assetId: string; riskId: string },
  { state: RootState; rejectValue: string }
>(
  "assets/addRisk",
  async ({ assetId, riskId }, { rejectWithValue }) => {
    try {
      const asset = await getAssetById(assetId);
      if (!asset.relatedRisks.includes(riskId)) {
        const updated = await updateAssetApi(asset.id, {
          ...asset,
          relatedRisks: [...asset.relatedRisks, riskId],
        });
        return updated;
      }
      return asset;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAssets.pending, state => { state.loading = true; state.error = null })
      .addCase(fetchAssets.fulfilled, (state, { payload }) => {
        state.loading = false; state.items = payload
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false; state.error = action.error.message ?? "Fetch failed"
      })
      builder.addCase(addAssetAsync.fulfilled, (state, action: PayloadAction<AssetDto>) => {
        state.items.push(action.payload)
      })
      .addCase(updateAssetAsync.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(a => a.id === payload.id)
        if (idx !== -1) state.items[idx] = payload
      })
      .addCase(deleteAssetAsync.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(a => a.id !== payload)
      })
      .addCase(addRiskToAsset.fulfilled, (state, { payload }) => {
        const index = state.items.findIndex(asset => asset.id === payload.id);
      if (index !== -1) state.items[index] = payload;
    });
  }
})

export default assetsSlice.reducer

