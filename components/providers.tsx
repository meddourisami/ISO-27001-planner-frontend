"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { useEffect, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCurrentUser } from "@/lib/features/auth/authSlice"
import { fetchEmployeesAsync, fetchTrainingsAsync } from "@/lib/features/training/trainingSlice"
import { fetchAuditsAsync } from "@/lib/features/audits/auditsSlice"
import { fetchNonConformitiesAsync } from "@/lib/features/nonconformities/nonconformitiesSlice"
import { fetchAssets } from "@/lib/features/assets/assetsSlice"
import { fetchRisks } from "@/lib/features/risks/risksSlice"
import { fetchDocumentsAsync } from "@/lib/features/documents/documentsSlice"
import { fetchTasksAsync } from "@/lib/features/tasks/tasksSlice"
import { fetchControlsAsync } from "@/lib/features/compliance/complianceSlice"

interface ProvidersProps {
  children: ReactNode
}

function AppInitializer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(fetchAssets(user.companyId))
      dispatch(fetchRisks(user.companyId))
      dispatch(fetchDocumentsAsync(user.companyId))
      dispatch(fetchAuditsAsync(user.companyId))
      dispatch(fetchTasksAsync(user.companyId))
      dispatch(fetchNonConformitiesAsync(user.companyId))
      dispatch(fetchControlsAsync(user.companyId))
      dispatch(fetchEmployeesAsync(user.companyId))
      dispatch(fetchTrainingsAsync(user.companyId))
    }
  }, [user?.companyId, dispatch]);

  

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AppInitializer />
      {children}
    </Provider>
  )
}

