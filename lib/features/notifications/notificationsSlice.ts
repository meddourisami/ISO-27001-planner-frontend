import { NotificationDto } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@utils/api";

interface NotificationState {
  items: NotificationDto[];
  loading: boolean;
  error?: string;
}

const initialState: NotificationState = { items: [], loading: false };

export const fetchNotificationsAsync = createAsyncThunk<
  NotificationDto[], number,
  { rejectValue: string }
>('notifications/fetch', async (companyId, { rejectWithValue }) => {
  try { return await fetchNotifications(companyId); }
  catch (e: any) { return rejectWithValue(e.message); }
});

export const markAllReadAsync = createAsyncThunk<
  void, number, { rejectValue: string }
>('notifications/markAllRead', async (companyId, { rejectWithValue }) => {
  try { return await markAllNotificationsRead(companyId); }
  catch (e: any) { return rejectWithValue(e.message); }
});

export const markReadAsync = createAsyncThunk<
  void, string, { rejectValue: string }
>('notifications/markRead', async (id, { rejectWithValue }) => {
  try { return await markNotificationRead(id); }
  catch (e: any) { return rejectWithValue(e.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsAsync.pending, (s) => { s.loading = true; s.error = undefined; })
      .addCase(fetchNotificationsAsync.fulfilled, (s, { payload }) => { s.items = payload; s.loading = false; })
      .addCase(fetchNotificationsAsync.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(markAllReadAsync.fulfilled, (s) => { s.items = s.items.map(n => ({ ...n, read: true })); })
      .addCase(markReadAsync.fulfilled, (s, { meta }) => {
        const id = meta.arg;
        const n = s.items.find(x => x.id === id);
        if (n) n.read = true;
      });
  },
});

export default notificationSlice.reducer;