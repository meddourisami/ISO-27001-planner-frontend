import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Document {
  id: string
  title: string
  description: string
  type: string
  status: string
  version: string
  owner: string
  approver: string
  approvalDate: string
  reviewDate: string
  content: string
}

interface DocumentsState {
  items: Document[]
}

const initialState: DocumentsState = {
  items: [
    {
      id: "1",
      title: "Information Security Policy",
      description: "Main policy document outlining the organization's approach to information security",
      type: "policy",
      status: "approved",
      version: "2.1",
      owner: "CISO",
      approver: "CEO",
      approvalDate: "2024-12-15",
      reviewDate: "2025-12-15",
      content: "This document outlines the organization's approach to information security...",
    },
    {
      id: "2",
      title: "Acceptable Use Policy",
      description: "Policy defining acceptable use of IT resources",
      type: "policy",
      status: "approved",
      version: "1.3",
      owner: "IT Director",
      approver: "CISO",
      approvalDate: "2025-01-10",
      reviewDate: "2026-01-10",
      content: "This policy defines the acceptable use of IT resources...",
    },
    {
      id: "3",
      title: "Access Control Procedure",
      description: "Procedure for managing access to systems and data",
      type: "procedure",
      status: "approved",
      version: "2.0",
      owner: "Security Manager",
      approver: "CISO",
      approvalDate: "2025-02-05",
      reviewDate: "2026-02-05",
      content: "This procedure outlines the process for requesting, approving, and revoking access...",
    },
    {
      id: "4",
      title: "Incident Response Plan",
      description: "Plan for responding to security incidents",
      type: "procedure",
      status: "approved",
      version: "1.5",
      owner: "Security Manager",
      approver: "CISO",
      approvalDate: "2025-01-20",
      reviewDate: "2026-01-20",
      content: "This plan outlines the steps to be taken in response to security incidents...",
    },
    {
      id: "5",
      title: "Risk Assessment Methodology",
      description: "Methodology for assessing information security risks",
      type: "standard",
      status: "approved",
      version: "1.2",
      owner: "Risk Manager",
      approver: "CISO",
      approvalDate: "2024-11-30",
      reviewDate: "2025-11-30",
      content: "This document defines the methodology for identifying, assessing, and treating risks...",
    },
    {
      id: "6",
      title: "Business Continuity Plan",
      description: "Plan for maintaining business operations during disruptions",
      type: "procedure",
      status: "review",
      version: "2.0",
      owner: "Business Continuity Manager",
      approver: "COO",
      approvalDate: "",
      reviewDate: "2025-06-15",
      content: "This plan outlines the steps to maintain critical business functions during disruptions...",
    },
    {
      id: "7",
      title: "Data Classification Standard",
      description: "Standard for classifying data based on sensitivity",
      type: "standard",
      status: "approved",
      version: "1.1",
      owner: "Data Protection Officer",
      approver: "CISO",
      approvalDate: "2025-01-05",
      reviewDate: "2026-01-05",
      content: "This standard defines the data classification levels and handling requirements...",
    },
    {
      id: "8",
      title: "Secure Development Policy",
      description: "Policy for secure software development",
      type: "policy",
      status: "draft",
      version: "1.0",
      owner: "Development Manager",
      approver: "CTO",
      approvalDate: "",
      reviewDate: "",
      content: "This policy outlines the requirements for secure software development...",
    },
    {
      id: "9",
      title: "Vulnerability Management Procedure",
      description: "Procedure for managing vulnerabilities",
      type: "procedure",
      status: "approved",
      version: "1.4",
      owner: "Security Operations Manager",
      approver: "CISO",
      approvalDate: "2024-12-10",
      reviewDate: "2025-12-10",
      content: "This procedure outlines the process for identifying, assessing, and remediating vulnerabilities...",
    },
    {
      id: "10",
      title: "Security Awareness Training Material",
      description: "Training materials for security awareness",
      type: "record",
      status: "approved",
      version: "3.0",
      owner: "Security Awareness Manager",
      approver: "CISO",
      approvalDate: "2025-02-20",
      reviewDate: "2025-08-20",
      content: "These materials are used for security awareness training...",
    },
  ],
}

export const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    addDocument: (state, action: PayloadAction<Document>) => {
      state.items.push(action.payload)
    },
    updateDocument: (state, action: PayloadAction<Document>) => {
      const index = state.items.findIndex((doc) => doc.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((doc) => doc.id !== action.payload)
    },
  },
})

export const { addDocument, updateDocument, deleteDocument } = documentsSlice.actions

export default documentsSlice.reducer

