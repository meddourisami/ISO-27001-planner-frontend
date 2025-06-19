import { EmployeeDto, TrainingDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assignEmployeeToTraining, createEmployee, createTraining, deleteEmployeeBackend, deleteTrainingBackend, fetchEmployees, fetchTrainings, markTrainingCompleted, updateEmployeeBackend, updateTrainingBackend } from "@utils/api";

interface TrainingState {
  items: TrainingDto[];
  employees: EmployeeDto[];
  loading: boolean;
  error?: string;
}

const initialState: TrainingState = {
  items: [],
  employees: [],
  loading: false,
  error: undefined,
};

// Thunks
export const fetchTrainingsAsync = createAsyncThunk<TrainingDto[], number>(
  'training/fetchTrainings',
  async (companyId, { rejectWithValue }) => {
    try { return await fetchTrainings(companyId); }
    catch (e:any) { return rejectWithValue(e.message); }
  }
);

export const addTrainingAsync = createAsyncThunk<TrainingDto, Omit<TrainingDto, 'id'>>(
  'training/addTraining',
  async (dto, { rejectWithValue }) => {
    try {
      return await createTraining(dto);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateTrainingAsync = createAsyncThunk<TrainingDto, TrainingDto>(
  'training/updateTraining',
  async (dto, { rejectWithValue }) => {
    if (!dto.id) throw new Error("Missing id");
    try { return await updateTrainingBackend(dto.id, dto); }
    catch (e:any) { return rejectWithValue(e.message); }
  }
);

export const deleteTrainingAsync = createAsyncThunk<string, string>(
  'training/deleteTraining',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTrainingBackend(id);
      return id;
    } catch (e:any) {
      return rejectWithValue(e.message);
    }
  }
);

// Employee Thunks
export const fetchEmployeesAsync = createAsyncThunk<EmployeeDto[], number>(
  'training/fetchEmployees',
  async (companyId, { rejectWithValue }) => {
    try { return await fetchEmployees(companyId); }
    catch (e:any) { return rejectWithValue(e.message); }
  }
);

export const addEmployeeAsync = createAsyncThunk<EmployeeDto , Omit<EmployeeDto, 'id'>>(
  'training/addEmployee',
  async (dto, { rejectWithValue }) => {
    try { return await createEmployee(dto); }
    catch (e:any) { return rejectWithValue(e.message); }
  }
);

export const updateEmployeeAsync = createAsyncThunk<EmployeeDto, EmployeeDto>(
  'training/updateEmployee',
  async (dto, { rejectWithValue }) => {
    if (!dto.id) throw new Error("Missing id");
    try { return await updateEmployeeBackend(dto.id, dto); }
    catch (e:any) { return rejectWithValue(e.message); }
  }
);

export const deleteEmployeeAsync = createAsyncThunk<string, string>(
  'training/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeBackend(id);
      return id;
    } catch (e:any) {
      return rejectWithValue(e.message);
    }
  }
);

export const assignEmployeeAsync = createAsyncThunk<
  string,
  { trainingId: string; employeeId: string }>(
  "training/assignEmployee",
  async ({ trainingId, employeeId }, { rejectWithValue }) => {
    try {
      return await assignEmployeeToTraining(trainingId, employeeId);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const markCompletedAsync = createAsyncThunk<
  void,
  { employeeId: string; trainingId: string }
>(
  "training/markCompleted",
  async ({ employeeId, trainingId }, { rejectWithValue }) => {
    try {
      await markTrainingCompleted(employeeId, trainingId);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// Slice
export const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    // no sync reducers needed
  },
  extraReducers: (builder) => {
    builder
      // Training
      .addCase(fetchTrainingsAsync.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(fetchTrainingsAsync.fulfilled, (s, action) => {
        s.items = action.payload;
        s.loading = false;
      })
      .addCase(fetchTrainingsAsync.rejected, (s, action) => {
        s.error = action.payload as string;
        s.loading = false;
      })
      .addCase(addTrainingAsync.fulfilled, (s, action) => {
        s.items.push(action.payload);
      })
      .addCase(updateTrainingAsync.fulfilled, (s, action) => {
        const idx = s.items.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) s.items[idx] = action.payload;
      })
      .addCase(deleteTrainingAsync.fulfilled, (s, action) => {
        s.items = s.items.filter(t => t.id !== action.payload);
      })

      // Employees
      .addCase(fetchEmployeesAsync.fulfilled, (s, action) => {
        s.employees = action.payload;
      })
      .addCase(addEmployeeAsync.fulfilled, (s, action) => {
        s.employees.push(action.payload);
      })
      .addCase(updateEmployeeAsync.fulfilled, (s, action) => {
        const idx = s.employees.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) s.employees[idx] = action.payload;
      })
      .addCase(deleteEmployeeAsync.fulfilled, (s, action) => {
        s.employees = s.employees.filter(e => e.id !== action.payload);
      })
      .addCase(assignEmployeeAsync.fulfilled, (state, action) => {
      })
      .addCase(markCompletedAsync.fulfilled, (state, action) => {
      })

      // Handle errors globally (optional)
      .addMatcher(
        (action): action is ReturnType<typeof fetchTrainingsAsync.rejected> |
                   ReturnType<typeof addTrainingAsync.rejected> |
                   ReturnType<typeof updateTrainingAsync.rejected> |
                   ReturnType<typeof deleteTrainingAsync.rejected> |
                   ReturnType<typeof fetchEmployeesAsync.rejected> |
                   ReturnType<typeof addEmployeeAsync.rejected> |
                   ReturnType<typeof updateEmployeeAsync.rejected> |
                   ReturnType<typeof deleteEmployeeAsync.rejected> =>
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred';
        }
      )
    }
  });

export default trainingSlice.reducer;