import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { decodeToken, getAccessToken, setAccessToken } from "@/lib/auth"
import api from "@/lib/axios"

export function useAuthTokenRefresh() {
  const router = useRouter()

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = getAccessToken()

      if (!token) {
        router.push("/login")
        return
      }

      try {
        const decoded: any = decodeToken(token)
        const now = Date.now() / 1000

        if (decoded.exp && decoded.exp < now) {
          // Token expired – try to refresh
          const refreshToken = localStorage.getItem("refreshToken")
          if (!refreshToken) {
            throw new Error("No refresh token found")
          }

          const { data } = await api.post("/auth/refresh", { refreshToken })
          setAccessToken(data.accessToken)
        }
      } catch (err) {
        console.error("Token invalid or refresh failed:", err)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.push("/login")
      }
    }

    checkTokenValidity()
  }, [router])
}