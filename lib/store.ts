import { configureStore } from "@reduxjs/toolkit"
import risksReducer from "@/lib/features/risks/risksSlice"
import documentsReducer from "@/lib/features/documents/documentsSlice"
import auditsReducer from "@/lib/features/audits/auditsSlice"
import tasksReducer from "@/lib/features/tasks/tasksSlice"
import complianceReducer from "@/lib/features/compliance/complianceSlice"
import assetsReducer from "@/lib/features/assets/assetsSlice"
import trainingReducer from "@/lib/features/training/trainingSlice"
import nonconformitiesReducer from "@/lib/features/nonconformities/nonconformitiesSlice"
import authReducer from "@/lib/features/auth/authSlice"
import adminReducer from "@/lib/features/admin/adminSlice"
import { listenerMiddleware } from "./features/listeners/listenerMiddleware"



export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    risks: risksReducer,
    documents: documentsReducer,
    audits: auditsReducer,
    tasks: tasksReducer,
    compliance: complianceReducer,
    assets: assetsReducer,
    training: trainingReducer,
    nonconformities: nonconformitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

