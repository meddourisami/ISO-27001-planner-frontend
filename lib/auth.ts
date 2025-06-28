import api from "./axios"
import { BackendUser } from "@/types"

interface AuthResponse {
  accessToken: string
  refreshToken: string
  mfaRequired: boolean
}

interface MfaVerifyResponse {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  mfaEnabled: boolean
}

// --- Helper functions to manage tokens ---
function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken)
  localStorage.setItem("refreshToken", refreshToken)
}

function clearTokens() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

export function decodeToken(token: string): any | null {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// --- Auth API functions ---

// 📥 LOGIN: returns mfaRequired and stores tokens only if MFA not required
export async function login(email: string, password: string): Promise<{ email: string; requiresMfa: boolean }> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password })

  if (!data.mfaRequired) {
    setTokens(data.accessToken, data.refreshToken)
  }

  const decoded = decodeToken(data.accessToken)
  const extractedEmail = decoded?.sub || email

  //const { setUser } = useAuth();
  //const currentUser = await getCurrentUserDetails();
  //setUser(currentUser);

  return {
    email: extractedEmail,
    requiresMfa: data.mfaRequired,
  }
}

// 🔐 MFA CODE (sent via email): verify it and store tokens
export async function verifyMfa(email: string, code: string): Promise<void> {
  const res = await api.post<MfaVerifyResponse>("/mfa/verify", { email, code })

  const { accessToken, refreshToken } = res.data
  setTokens(accessToken, refreshToken)
}

// 🛠️ MFA Setup (not used if MFA is sent by email, kept for future)
export async function enableMfa(email: string): Promise<void> {
  await api.post("/mfa/enable", { email }) // Sends code to email
}


// 👤 Update Profile
export async function updateProfile(data: {  fullName: string; email: string }): Promise<void> {
  await api.put("/user/update-profile", data)
}

// ✅ Change password using authenticated user context
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/user/change-password", { currentPassword, newPassword })
}

// ✅ Logout current user
export async function logout(): Promise<void> {
  await api.post("/auth/logout-self")
  clearTokens()
}

// 🧠 Get Access Token from LocalStorage
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken")
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem("accessToken", accessToken)
}

// 🧍 Get Current User from token
export function getCurrentUser(): { email: string; role: string; sub: string } | null {
  const token = getAccessToken()
  if (!token) return null

  try {
    const [, payload] = token.split(".")
    const decoded = JSON.parse(atob(payload))
    console.log(decoded,"decoded token")
    return {
      email: decoded.sub,
      role: decoded.role,
      sub: decoded.sub,
    }
  } catch {
    return null
  }
}

export async function getCurrentUserDetails(): Promise<BackendUser> {
  try {
    const { data } = await api.get("/user/me")
    return data
  } catch (err: any) {
    console.error("User fetch failed:", err.response?.message || err.message)
    throw err
  }
}

// Resend MFA code
export async function resendMfa(email: string): Promise<void> {
  await api.post(`/mfa/resend?email=${encodeURIComponent(email)}`)
}

// Disable MFA for user
export async function disableMfa(email: string): Promise<void> {
  await api.post("/mfa/disable", { email })
}

export async function verifyMfaSetup(email: string, code: string): Promise<void> {
  await api.post("/mfa/verify-setup", { email, code });
}