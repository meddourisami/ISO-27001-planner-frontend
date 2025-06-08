export interface BackendUser {
  id: number
  email: string
  fullName: string
  role: string
  mfaEnabled: boolean
  companyId: number
}

export interface User extends BackendUser {
  status: "active" | "inactive"
}