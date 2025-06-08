"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import type { ReactNode } from "react"
import { AuthProvider } from "@/context/AuthContext"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  )
}

