import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface NonConformity {
  id: string
  title: string
  description: string
  source: string
  sourceReference: string
  dateIdentified: string
  severity: string
  status: string
  owner: string
  dueDate: string
  relatedControls: string[]
  relatedRisks: string[]
  correctiveActions: string
  evidence: string
  verificationStatus: string
  verificationDate?: string
  verifiedBy?: string
  comments?: string
}

interface NonConformitiesState {
  items: NonConformity[]
}

const initialState: NonConformitiesState = {
  items: [
    {
      id: "1",
      title: "Incomplete Asset Inventory",
      description: "The asset inventory is not comprehensive and does not include all information assets.",
      source: "Internal Audit",
      sourceReference: "IA-2025-003",
      dateIdentified: "2025-02-15",
      severity: "major",
      status: "open",
      owner: "John Smith",
      dueDate: "2025-04-15",
      relatedControls: ["A.8.1.1"],
      relatedRisks: ["2"],
      correctiveActions: "Complete asset inventory with all information assets including classification and ownership.",
      evidence: "",
      verificationStatus: "pending",
    },
    {
      id: "2",
      title: "Inadequate Access Control Procedures",
      description: "Access control procedures do not include regular review of access rights.",
      source: "External Audit",
      sourceReference: "EA-2025-007",
      dateIdentified: "2025-01-20",
      severity: "major",
      status: "in-progress",
      owner: "Sarah Johnson",
      dueDate: "2025-03-30",
      relatedControls: ["A.9.2.5"],
      relatedRisks: ["4"],
      correctiveActions:
        "Update access control procedures to include quarterly review of access rights. Implement automated review process.",
      evidence: "Updated procedure document draft",
      verificationStatus: "pending",
    },
    {
      id: "3",
      title: "Missing Security Awareness Training Records",
      description: "Records of security awareness training completion are not maintained for all employees.",
      source: "Management Review",
      sourceReference: "MR-2025-002",
      dateIdentified: "2025-02-05",
      severity: "minor",
      status: "closed",
      owner: "Michael Chen",
      dueDate: "2025-03-15",
      relatedControls: ["A.7.2.2"],
      relatedRisks: [],
      correctiveActions:
        "Implement training management system to track all employee training completion. Backfill missing records.",
      evidence: "Training management system implemented with complete records",
      verificationStatus: "verified",
      verificationDate: "2025-03-10",
      verifiedBy: "Emily Johnson",
      comments: "All training records have been updated and verified complete.",
    },
    {
      id: "4",
      title: "Outdated Business Continuity Plan",
      description: "The business continuity plan has not been updated or tested in the last 12 months.",
      source: "Internal Audit",
      sourceReference: "IA-2025-008",
      dateIdentified: "2025-02-22",
      severity: "major",
      status: "in-progress",
      owner: "David Miller",
      dueDate: "2025-04-30",
      relatedControls: ["A.17.1.1", "A.17.1.2", "A.17.1.3"],
      relatedRisks: [],
      correctiveActions:
        "Update business continuity plan and conduct a full test. Document test results and implement improvements.",
      evidence: "Updated BCP draft completed",
      verificationStatus: "pending",
    },
    {
      id: "5",
      title: "Insufficient Logging and Monitoring",
      description:
        "Security logs are not being regularly reviewed and there is no automated alerting for security events.",
      source: "Risk Assessment",
      sourceReference: "RA-2025-012",
      dateIdentified: "2025-01-30",
      severity: "critical",
      status: "in-progress",
      owner: "Lisa Wong",
      dueDate: "2025-03-25",
      relatedControls: ["A.12.4.1", "A.12.4.2", "A.12.4.3"],
      relatedRisks: ["3", "5"],
      correctiveActions:
        "Implement SIEM solution for centralized logging. Configure automated alerts for security events. Establish log review procedures.",
      evidence: "SIEM implementation in progress, 60% complete",
      verificationStatus: "pending",
    },
    {
      id: "6",
      title: "Vendor Security Assessments Not Performed",
      description: "Security assessments of critical vendors have not been conducted as required by policy.",
      source: "External Audit",
      sourceReference: "EA-2025-011",
      dateIdentified: "2025-01-25",
      severity: "major",
      status: "open",
      owner: "Thomas Wilson",
      dueDate: "2025-04-25",
      relatedControls: ["A.15.1.1", "A.15.1.2"],
      relatedRisks: ["8"],
      correctiveActions:
        "Develop vendor assessment questionnaire. Conduct assessments for all critical vendors. Document results and remediation plans.",
      evidence: "",
      verificationStatus: "pending",
    },
    {
      id: "7",
      title: "Incomplete Incident Response Testing",
      description: "Incident response procedures have not been tested through simulation exercises.",
      source: "Management Review",
      sourceReference: "MR-2025-005",
      dateIdentified: "2025-02-10",
      severity: "minor",
      status: "open",
      owner: "John Smith",
      dueDate: "2025-05-10",
      relatedControls: ["A.16.1.5"],
      relatedRisks: [],
      correctiveActions:
        "Develop and conduct incident response simulation exercises. Document lessons learned and update procedures.",
      evidence: "",
      verificationStatus: "pending",
    },
    {
      id: "8",
      title: "Inadequate Physical Security Controls",
      description:
        "Server room access logs are not regularly reviewed and some access cards have not been deactivated for terminated employees.",
      source: "Internal Audit",
      sourceReference: "IA-2025-015",
      dateIdentified: "2025-03-05",
      severity: "major",
      status: "open",
      owner: "Robert Johnson",
      dueDate: "2025-04-05",
      relatedControls: ["A.11.1.2"],
      relatedRisks: ["6"],
      correctiveActions:
        "Review and update physical access control procedures. Conduct reconciliation of active access cards against current employees. Implement regular review process.",
      evidence: "",
      verificationStatus: "pending",
    },
  ],
}

export const nonconformitiesSlice = createSlice({
  name: "nonconformities",
  initialState,
  reducers: {
    addNonConformity: (state, action: PayloadAction<Omit<NonConformity, "id">>) => {
      state.items.push({
        ...action.payload,
        id: Date.now().toString(),
      })
    },
    updateNonConformity: (state, action: PayloadAction<NonConformity>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteNonConformity: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const { addNonConformity, updateNonConformity, deleteNonConformity } = nonconformitiesSlice.actions

export default nonconformitiesSlice.reducer

