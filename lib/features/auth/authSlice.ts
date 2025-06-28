import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { getCurrentUserDetails, verifyMfa, login, resendMfa, logout } from "@/lib/auth"
import type { BackendUser } from "@/types"

interface AuthState {
  user: BackendUser | null
  status: "idle" | "loading" | "failed"
  mfaRequired: boolean
  mfaEmail: string | null
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  mfaRequired: false,
  mfaEmail: null,
  error: null,
}

// Thunks
export const loginAsync = createAsyncThunk<
  { email: string; mfaRequired: boolean },
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await login(email, password);
      return { email: res.email, mfaRequired: res.requiresMfa };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const verifyMfaAsync = createAsyncThunk<void, { email: string; code: string }, { rejectValue: string }>(
  "auth/verifyMfa",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      await verifyMfa(email, code)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid MFA code")
    }
  }
)

export const resendMfaCode = createAsyncThunk<void, string, { rejectValue: string }>(
  "auth/resendMfa",
  async (email, { rejectWithValue }) => {
    try {
      await resendMfa(email)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to resend code")
    }
  }
)

export const fetchCurrentUser = createAsyncThunk<BackendUser, void, { rejectValue: string }>(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentUserDetails()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch user")
    }
  }
)

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await logout();
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOuT: (state) => {
      state.user = null
      state.mfaRequired = false
      state.mfaEmail = null
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, state => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, { payload }) => {
        state.status = "idle";
        state.mfaRequired = payload.mfaRequired;
        state.mfaEmail = payload.email;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(verifyMfaAsync.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(verifyMfaAsync.fulfilled, (state) => {
        state.status = "idle"
        state.mfaRequired = false
        state.mfaEmail = null
      })
      .addCase(verifyMfaAsync.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(resendMfaCode.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(resendMfaCode.fulfilled, (state) => {
        state.status = "idle"
      })
      .addCase(resendMfaCode.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<BackendUser>) => {
        state.status = "idle"
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(logoutAsync.fulfilled, (state) => {
      authSlice.caseReducers.logOuT(state);
    })
  },
})

export const { logOuT } = authSlice.actions
export default authSlice.reducer