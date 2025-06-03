import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Audit {
  id: string
  title: string
  description: string
  type: string
  scope: string
  date: string
  endDate: string
  status: string
  auditor: string
  findings: string
  nonConformities: number
  observations: number
  recommendations: number
}

interface AuditsState {
  items: Audit[]
}

const initialState: AuditsState = {
  items: [
    {
      id: "1",
      title: "Annual Internal Audit",
      description: "Comprehensive internal audit of all ISMS controls",
      type: "internal",
      scope: "All Annex A controls",
      date: "2025-04-15",
      endDate: "2025-04-20",
      status: "planned",
      auditor: "Internal Audit Team",
      findings: "",
      nonConformities: 0,
      observations: 0,
      recommendations: 0,
    },
    {
      id: "2",
      title: "ISO 27001 Surveillance Audit",
      description: "External surveillance audit by certification body",
      type: "surveillance",
      scope: "Sample of Annex A controls",
      date: "2025-06-10",
      endDate: "2025-06-12",
      status: "planned",
      auditor: "ABC Certification",
      findings: "",
      nonConformities: 0,
      observations: 0,
      recommendations: 0,
    },
    {
      id: "3",
      title: "Access Control Audit",
      description: "Focused audit on access control implementation",
      type: "internal",
      scope: "A.9 Access Control",
      date: "2025-03-05",
      endDate: "2025-03-07",
      status: "completed",
      auditor: "Security Team",
      findings: "Several issues identified with access review processes and privileged account management",
      nonConformities: 2,
      observations: 3,
      recommendations: 4,
    },
    {
      id: "4",
      title: "Supplier Security Audit",
      description: "Audit of key suppliers' security controls",
      type: "external",
      scope: "Critical suppliers",
      date: "2025-05-20",
      endDate: "2025-05-25",
      status: "planned",
      auditor: "Third-Party Risk Team",
      findings: "",
      nonConformities: 0,
      observations: 0,
      recommendations: 0,
    },
    {
      id: "5",
      title: "Physical Security Audit",
      description: "Audit of physical security controls",
      type: "internal",
      scope: "A.11 Physical and Environmental Security",
      date: "2025-02-15",
      endDate: "2025-02-16",
      status: "completed",
      auditor: "Facilities Team",
      findings: "Minor issues with visitor management and environmental controls",
      nonConformities: 0,
      observations: 2,
      recommendations: 3,
    },
  ],
}

export const auditsSlice = createSlice({
  name: "audits",
  initialState,
  reducers: {
    addAudit: (state, action: PayloadAction<Audit>) => {
      state.items.push(action.payload)
    },
    updateAudit: (state, action: PayloadAction<Audit>) => {
      const index = state.items.findIndex((audit) => audit.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteAudit: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((audit) => audit.id !== action.payload)
    },
  },
})

export const { addAudit, updateAudit, deleteAudit } = auditsSlice.actions

export default auditsSlice.reducer

