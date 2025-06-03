import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Control {
  id: string
  title: string
  description: string
  status: string
  evidence: string
  lastReview: string
}

interface ComplianceState {
  controls: Control[]
}

const initialState: ComplianceState = {
  controls: [
    {
      id: "A.5.1.1",
      title: "Policies for information security",
      description:
        "A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.",
      status: "implemented",
      evidence: "Information Security Policy document v2.1, approved on 2024-12-15",
      lastReview: "2025-01-15",
    },
    {
      id: "A.5.1.2",
      title: "Review of the policies for information security",
      description:
        "The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.",
      status: "implemented",
      evidence: "Policy review records, last review conducted on 2025-01-15",
      lastReview: "2025-01-15",
    },
    {
      id: "A.6.1.1",
      title: "Information security roles and responsibilities",
      description: "All information security responsibilities shall be defined and allocated.",
      status: "implemented",
      evidence: "Roles and responsibilities defined in Information Security Policy and job descriptions",
      lastReview: "2025-01-20",
    },
    {
      id: "A.6.1.2",
      title: "Segregation of duties",
      description:
        "Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization's assets.",
      status: "partial",
      evidence: "Segregation of duties implemented in key systems, but some legacy systems lack proper segregation",
      lastReview: "2025-01-20",
    },
    {
      id: "A.6.1.3",
      title: "Contact with authorities",
      description: "Appropriate contacts with relevant authorities shall be maintained.",
      status: "implemented",
      evidence: "Contact list maintained by Security Team, updated quarterly",
      lastReview: "2025-02-05",
    },
    {
      id: "A.6.1.4",
      title: "Contact with special interest groups",
      description:
        "Appropriate contacts with special interest groups or other specialist security forums and professional associations shall be maintained.",
      status: "implemented",
      evidence: "Memberships in security forums and industry groups",
      lastReview: "2025-02-05",
    },
    {
      id: "A.6.1.5",
      title: "Information security in project management",
      description:
        "Information security shall be addressed in project management, regardless of the type of the project.",
      status: "partial",
      evidence: "Security requirements included in project methodology, but not consistently applied",
      lastReview: "2025-02-10",
    },
    {
      id: "A.6.2.1",
      title: "Mobile device policy",
      description:
        "A policy and supporting security measures shall be adopted to manage the risks introduced by using mobile devices.",
      status: "implemented",
      evidence: "Mobile Device Policy v1.2, MDM solution implemented",
      lastReview: "2025-02-15",
    },
    {
      id: "A.6.2.2",
      title: "Teleworking",
      description:
        "A policy and supporting security measures shall be implemented to protect information accessed, processed or stored at teleworking sites.",
      status: "implemented",
      evidence: "Remote Working Policy v2.0, VPN and endpoint security controls",
      lastReview: "2025-02-15",
    },
    {
      id: "A.7.1.1",
      title: "Screening",
      description:
        "Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and shall be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.",
      status: "implemented",
      evidence: "HR procedures for background checks, sample records",
      lastReview: "2025-01-10",
    },
    {
      id: "A.7.1.2",
      title: "Terms and conditions of employment",
      description:
        "The contractual agreements with employees and contractors shall state their and the organization's responsibilities for information security.",
      status: "implemented",
      evidence: "Employment contracts with security clauses, confidentiality agreements",
      lastReview: "2025-01-10",
    },
    {
      id: "A.7.2.1",
      title: "Management responsibilities",
      description:
        "Management shall require all employees and contractors to apply information security in accordance with the established policies and procedures of the organization.",
      status: "implemented",
      evidence: "Management communications, performance objectives",
      lastReview: "2025-01-25",
    },
    {
      id: "A.7.2.2",
      title: "Information security awareness, education and training",
      description:
        "All employees of the organization and, where relevant, contractors shall receive appropriate awareness education and training and regular updates in organizational policies and procedures, as relevant for their job function.",
      status: "partial",
      evidence: "Security awareness program in place, but training completion rates below target",
      lastReview: "2025-01-25",
    },
    {
      id: "A.7.2.3",
      title: "Disciplinary process",
      description:
        "There shall be a formal and communicated disciplinary process to take action against employees who have committed an information security breach.",
      status: "implemented",
      evidence: "Disciplinary procedure documented in HR policies",
      lastReview: "2025-01-30",
    },
    {
      id: "A.7.3.1",
      title: "Termination or change of employment responsibilities",
      description:
        "Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, communicated to the employee or contractor and enforced.",
      status: "implemented",
      evidence: "Offboarding procedures, exit interviews",
      lastReview: "2025-01-30",
    },
    {
      id: "A.8.1.1",
      title: "Inventory of assets",
      description:
        "Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained.",
      status: "partial",
      evidence: "Asset inventory exists but not comprehensive for all asset types",
      lastReview: "2025-02-20",
    },
    {
      id: "A.8.1.2",
      title: "Ownership of assets",
      description: "Assets maintained in the inventory shall be owned.",
      status: "implemented",
      evidence: "Asset owners defined in asset inventory",
      lastReview: "2025-02-20",
    },
    {
      id: "A.8.1.3",
      title: "Acceptable use of assets",
      description:
        "Rules for the acceptable use of information and of assets associated with information and information processing facilities shall be identified, documented and implemented.",
      status: "implemented",
      evidence: "Acceptable Use Policy v1.3",
      lastReview: "2025-02-25",
    },
    {
      id: "A.8.1.4",
      title: "Return of assets",
      description:
        "All employees and external party users shall return all of the organizational assets in their possession upon termination of their employment, contract or agreement.",
      status: "implemented",
      evidence: "Asset return process, offboarding checklist",
      lastReview: "2025-02-25",
    },
    {
      id: "A.8.2.1",
      title: "Classification of information",
      description:
        "Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.",
      status: "implemented",
      evidence: "Data Classification Standard v1.1",
      lastReview: "2025-03-01",
    },
    {
      id: "A.8.2.2",
      title: "Labelling of information",
      description:
        "An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organization.",
      status: "partial",
      evidence: "Labeling procedures defined but inconsistently applied",
      lastReview: "2025-03-01",
    },
    {
      id: "A.8.2.3",
      title: "Handling of assets",
      description:
        "Procedures for handling assets shall be developed and implemented in accordance with the information classification scheme adopted by the organization.",
      status: "partial",
      evidence: "Handling procedures defined but not fully implemented for all asset types",
      lastReview: "2025-03-05",
    },
    {
      id: "A.8.3.1",
      title: "Management of removable media",
      description:
        "Procedures shall be implemented for the management of removable media in accordance with the classification scheme adopted by the organization.",
      status: "implemented",
      evidence: "Removable Media Policy, technical controls to restrict usage",
      lastReview: "2025-03-10",
    },
    {
      id: "A.8.3.2",
      title: "Disposal of media",
      description: "Media shall be disposed of securely when no longer required, using formal procedures.",
      status: "implemented",
      evidence: "Media Disposal Procedure, certificates of destruction",
      lastReview: "2025-03-10",
    },
    {
      id: "A.8.3.3",
      title: "Physical media transfer",
      description:
        "Media containing information shall be protected against unauthorized access, misuse or corruption during transportation.",
      status: "implemented",
      evidence: "Secure courier services, encryption of sensitive data on portable media",
      lastReview: "2025-03-15",
    },
    {
      id: "A.9.1.1",
      title: "Access control policy",
      description:
        "An access control policy shall be established, documented and reviewed based on business and information security requirements.",
      status: "implemented",
      evidence: "Access Control Policy v2.0",
      lastReview: "2025-02-05",
    },
    {
      id: "A.9.1.2",
      title: "Access to networks and network services",
      description:
        "Users shall only be provided with access to the network and network services that they have been specifically authorized to use.",
      status: "partial",
      evidence: "Network access controls implemented but some legacy systems lack proper controls",
      lastReview: "2025-02-05",
    },
    {
      id: "A.9.2.1",
      title: "User registration and de-registration",
      description:
        "A formal user registration and de-registration process shall be implemented to enable assignment of access rights.",
      status: "implemented",
      evidence: "User management procedures, automated provisioning system",
      lastReview: "2025-02-10",
    },
    {
      id: "A.9.2.2",
      title: "User access provisioning",
      description:
        "A formal user access provisioning process shall be implemented to assign or revoke access rights for all user types to all systems and services.",
      status: "implemented",
      evidence: "Access request and approval workflow",
      lastReview: "2025-02-10",
    },
    {
      id: "A.9.2.3",
      title: "Management of privileged access rights",
      description: "The allocation and use of privileged access rights shall be restricted and controlled.",
      status: "partial",
      evidence: "Privileged access management process, but some systems lack proper controls",
      lastReview: "2025-02-15",
    },
    {
      id: "A.9.2.4",
      title: "Management of secret authentication information of users",
      description:
        "The allocation of secret authentication information shall be controlled through a formal management process.",
      status: "implemented",
      evidence: "Password management procedures, self-service password reset",
      lastReview: "2025-02-15",
    },
    {
      id: "A.9.2.5",
      title: "Review of user access rights",
      description: "Asset owners shall review users' access rights at regular intervals.",
      status: "partial",
      evidence: "Access reviews conducted but not consistently across all systems",
      lastReview: "2025-02-20",
    },
    {
      id: "A.9.2.6",
      title: "Removal or adjustment of access rights",
      description:
        "The access rights of all employees and external party users to information and information processing facilities shall be removed upon termination of their employment, contract or agreement, or adjusted upon change.",
      status: "implemented",
      evidence: "Offboarding process, access revocation records",
      lastReview: "2025-02-20",
    },
    {
      id: "A.9.3.1",
      title: "Use of secret authentication information",
      description:
        "Users shall be required to follow the organization's practices in the use of secret authentication information.",
      status: "implemented",
      evidence: "Password Policy, user awareness training",
      lastReview: "2025-02-25",
    },
    {
      id: "A.9.4.1",
      title: "Information access restriction",
      description:
        "Access to information and application system functions shall be restricted in accordance with the access control policy.",
      status: "implemented",
      evidence: "Role-based access controls in key applications",
      lastReview: "2025-03-01",
    },
    {
      id: "A.9.4.2",
      title: "Secure log-on procedures",
      description:
        "Where required by the access control policy, access to systems and applications shall be controlled by a secure log-on procedure.",
      status: "partial",
      evidence: "Secure login implemented for most systems, but some legacy applications lack proper controls",
      lastReview: "2025-03-01",
    },
    {
      id: "A.9.4.3",
      title: "Password management system",
      description: "Password management systems shall be interactive and shall ensure quality passwords.",
      status: "implemented",
      evidence: "Password management system with complexity requirements",
      lastReview: "2025-03-05",
    },
    {
      id: "A.9.4.4",
      title: "Use of privileged utility programs",
      description:
        "The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.",
      status: "partial",
      evidence: "Controls for utility programs implemented but monitoring needs improvement",
      lastReview: "2025-03-05",
    },
    {
      id: "A.9.4.5",
      title: "Access control to program source code",
      description: "Access to program source code shall be restricted.",
      status: "implemented",
      evidence: "Source code repository access controls, code signing procedures",
      lastReview: "2025-03-10",
    },
  ],
}

export const complianceSlice = createSlice({
  name: "compliance",
  initialState,
  reducers: {
    updateControlStatus: (state, action: PayloadAction<{ id: string; status: string; evidence: string }>) => {
      const index = state.controls.findIndex((control) => control.id === action.payload.id)
      if (index !== -1) {
        state.controls[index].status = action.payload.status
        state.controls[index].evidence = action.payload.evidence
        state.controls[index].lastReview = new Date().toISOString().split("T")[0]
      }
    },
  },
})

export const { updateControlStatus } = complianceSlice.actions

export default complianceSlice.reducer

