"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/dashboard"
import { Providers } from "@/components/providers"
import { useAuthTokenRefresh } from "@/hooks/useAuthTokenRefresh"
import { fetchCurrentUser } from "@/lib/features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"

export default function Home() {
  useAuthTokenRefresh()
  const router = useRouter();
  const dispatch = useAppDispatch()
  const { user, mfaRequired, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    if (status === 'idle' && !user && !mfaRequired) {
      router.push('/login')
    }
  }, [status, user, mfaRequired, router])

  return (
    <main className="min-h-screen bg-background">
      <Providers>
        <Dashboard />
      </Providers>
    </main>
  )
}