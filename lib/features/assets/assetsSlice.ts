import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Asset {
  id: string
  name: string
  description: string
  type: string
  classification: string
  owner: string
  location: string
  status: string
  value: string
  vulnerabilities: string
  controls: string
  lastReview: string
  relatedRisks: string[]
}

interface AssetsState {
  items: Asset[]
}

const initialState: AssetsState = {
  items: [
    {
      id: "1",
      name: "Customer Database Server",
      description: "Primary database server hosting customer information",
      type: "system",
      classification: "restricted",
      owner: "Database Administrator",
      location: "Main Data Center",
      status: "active",
      value: "critical",
      vulnerabilities: "Outdated database version, limited patch management",
      controls: "Firewall, access controls, encryption at rest",
      lastReview: "2025-02-15",
      relatedRisks: ["1", "4"],
    },
    {
      id: "2",
      name: "Corporate File Server",
      description: "Server hosting internal documents and shared files",
      type: "system",
      classification: "confidential",
      owner: "IT Manager",
      location: "Main Data Center",
      status: "active",
      value: "high",
      vulnerabilities: "Large number of users with access",
      controls: "Access controls, audit logging, backup system",
      lastReview: "2025-02-10",
      relatedRisks: ["2"],
    },
    {
      id: "3",
      name: "Email System",
      description: "Corporate email infrastructure",
      type: "system",
      classification: "confidential",
      owner: "IT Manager",
      location: "Cloud",
      status: "active",
      value: "high",
      vulnerabilities: "Phishing susceptibility",
      controls: "Email filtering, SPF, DKIM, DMARC",
      lastReview: "2025-01-20",
      relatedRisks: ["3"],
    },
    {
      id: "4",
      name: "VPN Server",
      description: "Remote access VPN server",
      type: "system",
      classification: "confidential",
      owner: "Network Administrator",
      location: "Main Data Center",
      status: "active",
      value: "high",
      vulnerabilities: "Potential for brute force attacks",
      controls: "Multi-factor authentication, access controls, logging",
      lastReview: "2025-01-25",
      relatedRisks: ["4"],
    },
    {
      id: "5",
      name: "Corporate Workstations",
      description: "Employee desktop and laptop computers",
      type: "hardware",
      classification: "internal",
      owner: "IT Support",
      location: "Various",
      status: "active",
      value: "medium",
      vulnerabilities: "Inconsistent patching, potential for malware",
      controls: "Endpoint protection, patch management, disk encryption",
      lastReview: "2025-02-05",
      relatedRisks: ["5"],
    },
    {
      id: "6",
      name: "Data Center",
      description: "Primary data center facility",
      type: "facility",
      classification: "restricted",
      owner: "Facilities Manager",
      location: "Headquarters",
      status: "active",
      value: "critical",
      vulnerabilities: "Physical access vulnerabilities",
      controls: "Access control system, CCTV, environmental monitoring",
      lastReview: "2025-01-15",
      relatedRisks: ["6"],
    },
    {
      id: "7",
      name: "Cloud Infrastructure",
      description: "AWS/Azure cloud infrastructure",
      type: "system",
      classification: "confidential",
      owner: "Cloud Architect",
      location: "Cloud",
      status: "active",
      value: "high",
      vulnerabilities: "Potential misconfigurations, excessive permissions",
      controls: "Security groups, IAM policies, monitoring",
      lastReview: "2025-02-20",
      relatedRisks: ["7"],
    },
    {
      id: "8",
      name: "Customer Data",
      description: "All customer personal and financial information",
      type: "data",
      classification: "restricted",
      owner: "Data Protection Officer",
      location: "Various",
      status: "active",
      value: "critical",
      vulnerabilities: "Distributed across multiple systems",
      controls: "Encryption, access controls, data loss prevention",
      lastReview: "2025-02-01",
      relatedRisks: ["1", "4", "7"],
    },
    {
      id: "9",
      name: "Financial System",
      description: "ERP and financial management system",
      type: "software",
      classification: "restricted",
      owner: "Finance Director",
      location: "Main Data Center",
      status: "active",
      value: "critical",
      vulnerabilities: "Limited segregation of duties",
      controls: "Access controls, audit logging, regular reviews",
      lastReview: "2025-01-10",
      relatedRisks: ["5", "8"],
    },
    {
      id: "10",
      name: "Third-Party Integrations",
      description: "Connections to vendor and partner systems",
      type: "system",
      classification: "confidential",
      owner: "Integration Manager",
      location: "Various",
      status: "active",
      value: "high",
      vulnerabilities: "Limited control over external systems",
      controls: "API security, data validation, monitoring",
      lastReview: "2025-02-25",
      relatedRisks: ["8"],
    },
  ],
}

export const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      // Create a completely new asset object with a new relatedRisks array
      const newAsset = {
        ...action.payload,
        relatedRisks: Array.isArray(action.payload.relatedRisks) ? [...action.payload.relatedRisks] : [],
      }
      state.items.push(newAsset)
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.items.findIndex((asset) => asset.id === action.payload.id)
      if (index !== -1) {
        // Create a completely new object with a new relatedRisks array
        state.items[index] = {
          ...action.payload,
          relatedRisks: Array.isArray(action.payload.relatedRisks) ? [...action.payload.relatedRisks] : [],
        }
      }
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((asset) => asset.id !== action.payload)
    },
  },
})

export const { addAsset, updateAsset, deleteAsset } = assetsSlice.actions

export default assetsSlice.reducer

