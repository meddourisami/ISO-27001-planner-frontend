import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Risk {
  id: string
  title: string
  description: string
  asset: string
  threat: string
  vulnerability: string
  likelihood: string
  impact: string
  severity: string
  status: string
  owner: string
  treatment: string
  controls: string
  dueDate: string
}

interface RisksState {
  items: Risk[]
}

const initialState: RisksState = {
  items: [
    {
      id: "1",
      title: "Unauthorized Access to Customer Data",
      description: "Risk of unauthorized access to sensitive customer information due to weak access controls",
      asset: "Customer Database",
      threat: "Malicious actors, insider threats",
      vulnerability: "Weak access controls, excessive privileges",
      likelihood: "medium",
      impact: "high",
      severity: "high",
      status: "in-progress",
      owner: "John Smith",
      treatment: "mitigate",
      controls: "Implement role-based access control, regular access reviews",
      dueDate: "2025-05-15",
    },
    {
      id: "2",
      title: "Data Loss Due to Inadequate Backup",
      description: "Risk of data loss due to inadequate backup procedures and testing",
      asset: "Corporate File Servers",
      threat: "System failure, human error",
      vulnerability: "Inconsistent backup processes",
      likelihood: "medium",
      impact: "high",
      severity: "high",
      status: "open",
      owner: "Sarah Johnson",
      treatment: "mitigate",
      controls: "Implement automated backup solution with regular testing",
      dueDate: "2025-04-30",
    },
    {
      id: "3",
      title: "Malware Infection via Email",
      description: "Risk of malware infection through phishing emails and malicious attachments",
      asset: "Corporate Email System",
      threat: "Phishing attacks, malware",
      vulnerability: "Lack of user awareness, inadequate email filtering",
      likelihood: "high",
      impact: "medium",
      severity: "high",
      status: "in-progress",
      owner: "Michael Chen",
      treatment: "mitigate",
      controls: "Email filtering, security awareness training",
      dueDate: "2025-04-10",
    },
    {
      id: "4",
      title: "Insecure Remote Access",
      description: "Risk of unauthorized access due to insecure remote access solutions",
      asset: "VPN and Remote Access Systems",
      threat: "External attackers",
      vulnerability: "Weak authentication, unpatched VPN software",
      likelihood: "medium",
      impact: "high",
      severity: "high",
      status: "open",
      owner: "Lisa Wong",
      treatment: "mitigate",
      controls: "Implement MFA, regular patching, secure configuration",
      dueDate: "2025-05-20",
    },
    {
      id: "5",
      title: "Unpatched Software Vulnerabilities",
      description: "Risk of exploitation of known vulnerabilities in unpatched software",
      asset: "Corporate Workstations and Servers",
      threat: "Malware, external attackers",
      vulnerability: "Delayed patch application",
      likelihood: "high",
      impact: "high",
      severity: "critical",
      status: "in-progress",
      owner: "David Miller",
      treatment: "mitigate",
      controls: "Automated patch management, vulnerability scanning",
      dueDate: "2025-04-05",
    },
    {
      id: "6",
      title: "Inadequate Physical Security",
      description: "Risk of unauthorized physical access to server rooms and sensitive areas",
      asset: "Data Centers and Server Rooms",
      threat: "Unauthorized personnel, theft",
      vulnerability: "Insufficient access controls, lack of monitoring",
      likelihood: "low",
      impact: "high",
      severity: "medium",
      status: "mitigated",
      owner: "Robert Johnson",
      treatment: "mitigate",
      controls: "Access control systems, CCTV, visitor management",
      dueDate: "2025-03-15",
    },
    {
      id: "7",
      title: "Insecure Cloud Configuration",
      description: "Risk of data exposure due to misconfigured cloud services",
      asset: "Cloud Infrastructure",
      threat: "External attackers, accidental exposure",
      vulnerability: "Misconfiguration, lack of security expertise",
      likelihood: "medium",
      impact: "high",
      severity: "high",
      status: "open",
      owner: "Jennifer Lee",
      treatment: "mitigate",
      controls: "Cloud security posture management, security reviews",
      dueDate: "2025-05-10",
    },
    {
      id: "8",
      title: "Inadequate Third-Party Security",
      description: "Risk of data breach through third-party service providers",
      asset: "Third-Party Services and Integrations",
      threat: "Supply chain attacks",
      vulnerability: "Lack of vendor security assessment",
      likelihood: "medium",
      impact: "medium",
      severity: "medium",
      status: "in-progress",
      owner: "Thomas Wilson",
      treatment: "transfer",
      controls: "Vendor security assessments, contractual requirements",
      dueDate: "2025-06-15",
    },
  ],
}

export const risksSlice = createSlice({
  name: "risks",
  initialState,
  reducers: {
    addRisk: (state, action: PayloadAction<Risk>) => {
      state.items.push(action.payload)
    },
    updateRisk: (state, action: PayloadAction<Risk>) => {
      const index = state.items.findIndex((risk) => risk.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteRisk: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((risk) => risk.id !== action.payload)
    },
  },
})

export const { addRisk, updateRisk, deleteRisk } = risksSlice.actions

export default risksSlice.reducer

