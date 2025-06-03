"use client"

import { useEffect, useState } from "react"
import UserProfile from "@/components/user-profile"
import { getCurrentUser, getCurrentUserDetails } from "@/lib/auth"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const updatedUser = await getCurrentUserDetails()
      setUser(updatedUser)
    } catch (error) {
      console.error("Failed to refresh user data", error)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <main className="container py-10">
      <UserProfile user={user} onProfileRefresh={refreshUser} />
    </main>
  )
}

