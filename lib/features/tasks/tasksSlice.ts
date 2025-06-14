import { TaskDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createTask, deleteTaskApi, fetchTasks, updateTaskApi } from "@utils/api";

interface TasksState {
  items: TaskDto[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null
};

// ✅ Thunks
export const fetchTasksAsync = createAsyncThunk<TaskDto[], number>(
  'tasks/fetch',
  async (companyId, { rejectWithValue }) => {
    try {
      return await fetchTasks(companyId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTaskAsync = createAsyncThunk<TaskDto, TaskDto>(
  'tasks/add',
  async (dto, { rejectWithValue }) => {
    try {
      return await createTask(dto);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTaskAsync = createAsyncThunk<TaskDto, TaskDto>(
  'tasks/update',
  async ({ id, ...dto }, { rejectWithValue }) => {
    try {
      return await updateTaskApi(id!, dto as TaskDto);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTaskAsync = createAsyncThunk<string, string>(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTaskApi(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Slice
export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // add
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // update
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // delete
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      });
  }
});

export default tasksSlice.reducer;