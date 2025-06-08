"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAccessToken, getCurrentUser } from "@/lib/auth"
import Dashboard from "@/components/dashboard"
import { Providers } from "@/components/providers"
import { useAuthTokenRefresh } from "@/hooks/useAuthTokenRefresh"

export default function Home() {
  useAuthTokenRefresh()
  const router = useRouter()

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-background">
      <Providers>
          <Dashboard />
      </Providers>
    </main>
  )
}