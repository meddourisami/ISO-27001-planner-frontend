"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Dashboard from "@/components/dashboard"
import { Providers } from "@/components/providers"
import { useAuthTokenRefresh } from "@/hooks/useAuthTokenRefresh"
import { fetchCurrentUser } from "@/lib/features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchAssets } from "@/lib/features/assets/assetsSlice"
import { AppDispatch } from "@/lib/store"
import { useDispatch } from "react-redux"
import { fetchRisks } from "@/lib/features/risks/risksSlice"
import { fetchDocumentsAsync } from "@/lib/features/documents/documentsSlice"
import { fetchAuditsAsync } from "@/lib/features/audits/auditsSlice"
import { fetchTasksAsync } from "@/lib/features/tasks/tasksSlice"
import { fetchNonConformitiesAsync } from "@/lib/features/nonconformities/nonconformitiesSlice"
import { fetchControlsAsync } from "@/lib/features/compliance/complianceSlice"
import { fetchEmployeesAsync, fetchTrainingsAsync } from "@/lib/features/training/trainingSlice"
import RoleGuard from "@components/RoleGuard"

export default function Home() {
  useAuthTokenRefresh()
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>()
  const { user, mfaRequired, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    if (status === 'idle' && !user && !mfaRequired) {
      router.push('/login');
    } else if (status === 'idle' && user) {
      const isAdminPage = pathname.startsWith('/admin');
      if (user.role === 'SUPER_ADMIN') {
        // If super admin, stay on /admin or allow any page
        if (!isAdminPage && pathname !== '/admin') {
          router.push('/admin');
        }
      } else {
        // Not super admin: block access to /admin, redirect to main
        if (isAdminPage) {
          router.push('/');
        }
      }
    }
  }, [status, user, mfaRequired, router]);

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
  }, [dispatch, user?.companyId])

  return (
    <main className="min-h-screen bg-background">
      <Providers>
        <RoleGuard>
          <Dashboard />
        </RoleGuard>
      </Providers>
    </main>
  )
}