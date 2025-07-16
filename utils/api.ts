import { AssetDto, AuditDto, AuditLog, BackendUser, CompanyDTO, ControlDto, DocumentDto, DocumentVersionDto, EmployeeDto, NonConformityDto, RiskDto, TaskDto, TrainingDto, User } from "@/types";
import api from "../lib/axios";


//Company api endpoints
export async function fetchCompanyDetails() {
  const { data } = await api.get("/company/my");
  return data;
}

export async function fetchCompanyUsers() {
  const { data } = await api.get("/user/list-members");
  return data;
}

export async function updateCompanyDetails(details: { companyId: number; name: string; ismsScope: string }) {
  const { data } = await api.put("/company/update", details);
  return data;
}

export async function getCompanyById(id: number): Promise<CompanyDTO> {
  return (await api.get(`/company/${id}`)).data;
}

//Users api endpoints

export const registerMember = async (email: string, password: string, role: string) => {
  return api.post('/user/register-member', { email, password, role });
};

export const deleteMember = async (email: string) => {
  return api.delete('/user/delete-member', { params: { email } });
};

export const listMembers = async (): Promise<User[]> => {
  const response = await api.get('/user/list-members');
  return response.data.content;
};

export async function editMember(
  targetEmail: string,
  email: string,
  fullName: string,
  role: string
): Promise<void> {
  await api.put("/user/edit-member", { targetEmail, email, fullName, role });
}

//admin API endpoints

export async function fetchAdmins(): Promise<BackendUser[]> {
  return (await api.get('/user/admins')).data;
}

export interface AdminUserCreationRequest {
  email: string;
  password: string;
  companyName: string;
  scope: string;
}

export async function createAdmin(dto: AdminUserCreationRequest): Promise<string> {
  const response = await api.post('/admin/create-isms-admin', dto);
  return response.data; // "ISMS Admin and Company created successfully."
}

export async function updateAdmin(id: string, dto: Omit<BackendUser, 'id'>): Promise<BackendUser> {
  return (await api.put(`/admin/users/${id}`, dto)).data;
}

export async function deleteAdminApi(email: string): Promise<string> {
  return (await api.delete(`/admin/super-admin/delete-user/${encodeURIComponent(email)}`)).data;
}

//role api endpoints

export const fetchRoles = async (): Promise<string[]> => {
  const response = await api.get('/user/roles');
  return response.data;
};

//risk api endpoints

export async function getRiskById(id: string): Promise<RiskDto> {
  const res = await api.get<RiskDto>(`/risks/${id}`);
  return res.data;
}

export async function listRisks(companyId: number): Promise<RiskDto[]> {
  const { data } = await api.get<RiskDto[]>(`/risks/company/${companyId}`)
  return data
}

export async function createRisk(risk: Omit<RiskDto, 'id'>): Promise<RiskDto> {
  const { data } = await api.post<RiskDto>('/risks', risk);
  return data;
}

export async function updateRiskApi(risk: RiskDto): Promise<RiskDto> {
  if (!risk.id) throw new Error('Missing risk id')
  const { data } = await api.put<RiskDto>(`/risks/${risk.id}`, risk)
  return data
}

export async function deleteRiskApi(id: string): Promise<void> {
  await api.delete(`/risks/${id}`)
}

export async function getRiskMatrix(companyId: number): Promise<Record<string, Record<string, number>>> {
  const { data } = await api.get<Record<string, Record<string, number>>>(`/risks/matrix/${companyId}`)
  return data
}


//assets api endpoints

export async function getAssetById(id: string): Promise<AssetDto> {
  const res = await api.get<AssetDto>(`/assets/${id}`);
  return res.data;
}

export async function listAssets(companyId: number): Promise<AssetDto[]> {
  return (await api.get(`/assets/company/${companyId}`)).data
}
export async function createAsset(asset: Omit<AssetDto, 'id'> ): Promise<AssetDto> {
  return (await api.post(`/assets`, asset)).data
}
export async function updateAssetApi(id: string, dto: AssetDto): Promise<AssetDto> {
  return (await api.put(`/assets/${id}`, dto)).data
}
export async function deleteAssetApi(id: string): Promise<void> {
  await api.delete(`/assets/${id}`)
}

// document API endpoints

//export async function fetchDocuments(companyId: number): Promise<DocumentDto[]> {
//  return (await api.get(`/documents/company/${companyId}`)).data;
//}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page index (0‑based)
}

export async function fetchCompanyDocuments(
  companyId: number,
  page = 0,
  size = 10,
  search?: string,
  type?: string,
  sortBy = 'title',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<PaginatedResponse<DocumentDto>> {
  const params: Record<string, any> = { page, size, sortBy, sortOrder };
  if (search) params.search = search;
  if (type && type !== 'all') params.type = type;

  return (await api.get<PaginatedResponse<DocumentDto>>(
    `/documents/company/${companyId}`, { params }
  )).data;
}

export async function createDocumentWithFile(dto: DocumentDto, file: File): Promise<DocumentDto> {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  form.append("file", file);
  return (await api.post(`/documents`, form, { headers: { "Content-Type": "multipart/form-data" }, timeout: 10000, })).data;
}

export async function updateDocumentWithFile(
  id: string,
  dto: DocumentDto,
  file?: File
): Promise<string> {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(dto)], { type: "application/json" })
  );
  if (file) {
    form.append("file", file);
  }
  const res = await api.put(`/documents/${id}/update`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function approveDocumentApi(id: string): Promise<string> {
  const res = await api.put(`/documents/${id}/approve`);
  return res.data; 
}

export async function getVersionHistoryList(documentId: string): Promise<DocumentVersionDto[]> {
  const res = await api.get(`/documents/${documentId}/versions`);
  return res.data;
}

// Download specific version
export async function downloadVersion(versionId: number): Promise<Blob> {
  const res = await api.get(`/documents/download/${versionId}`, { responseType: "blob" });
  return res.data;
}

export async function searchInDocuments(query: string): Promise<DocumentVersionDto[]> {
  return (await api.get(`/documents/search`, { params: { query } })).data;
}

// Audit planning API endpoints

export async function fetchAudits(companyId: number): Promise<AuditDto[]> {
  return (await api.get(`audits/company/${companyId}`)).data;
}

export async function createAudit(dto: AuditDto): Promise<AuditDto> {
  return (await api.post(`/audits`, dto)).data;
}

export async function updateAuditApi(id: string, dto: AuditDto): Promise<AuditDto> {
  return (await api.put(`/audits/${id}`, dto)).data;
}

export async function deleteAuditApi(id: string): Promise<void> {
  await api.delete(`/audits/${id}`);
}

// Task management API endpoints

export async function fetchTasks(companyId: number): Promise<TaskDto[]> {
  return (await api.get(`/tasks/company/${companyId}`)).data;
}
export async function createTask(dto: TaskDto): Promise<TaskDto> {
  return (await api.post(`/tasks`, dto)).data;
}
export async function updateTaskApi(id: string, dto: TaskDto): Promise<TaskDto> {
  return (await api.put(`/tasks/${id}`, dto)).data;
}
export async function deleteTaskApi(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

// Non conformities API endpoints

export async function fetchNonConformities(companyId: number): Promise<NonConformityDto[]> {
  return (await api.get(`/nonconformities/company/${companyId}`)).data;
}

export async function createNonConformity(dto: NonConformityDto): Promise<NonConformityDto> {
  return (await api.post('/nonconformities', dto)).data;
}

export async function updateNonConformityApi(
  id: string,
  dto: Omit<NonConformityDto, 'id'>
): Promise<NonConformityDto> {
  const trimmedId = id.trim();
  const url = `/nonconformities/${trimmedId}`;
  return (await api.put(url, dto)).data;
}

export async function deleteNonConformityApi(id: string): Promise<void> {
  await api.delete(`/nonconformities/${id}`);
}

// Controls API endpoints

export async function fetchControlsByCompany(companyId: number): Promise<ControlDto[]> {
  return (await api.get(`/controls/company/${companyId}`)).data;
}

export interface ControlUpdateRequest {
  status: string;
  evidence: string;
}

export async function updateControlStatusBackend(id: string, req: ControlUpdateRequest): Promise<void> {
  await api.put(`/controls/${id}/update-status`, req);
}

// Employee and training API endpoints

export async function fetchTrainings(companyId: number): Promise<TrainingDto[]> {
  return (await api.get(`/trainings/company/${companyId}`)).data;
}

export async function createTraining(dto: TrainingDto): Promise<TrainingDto> {
  const { companyId, ...payload } = dto;
  return (
    await api.post(`/trainings/create`, payload, {
      params: { companyId },
    })
  ).data;
}

export async function updateTrainingBackend(id: string, dto: TrainingDto): Promise<TrainingDto> {
  return (await api.put(`/trainings/${id}`, dto)).data;
}

export async function deleteTrainingBackend(id: string): Promise<void> {
  await api.delete(`/trainings/${id}`);
}

export async function fetchEmployees(companyId: number): Promise<EmployeeDto[]> {
  return (await api.get(`/employees/company/${companyId}`)).data;
}

export async function createEmployee(dto: EmployeeDto): Promise<EmployeeDto> {
  const { companyId, ...payload } = dto;
  return (
    await api.post(`/employees`, payload, {
      params: { companyId },
    })
  ).data;
}

export async function updateEmployeeBackend(id: string, dto: EmployeeDto): Promise<EmployeeDto> {
  return (await api.put(`/employees/${id}`, dto)).data;
}

export async function deleteEmployeeBackend(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function assignEmployeeToTraining(
  trainingId: string,
  employeeId: string
): Promise<string> {
  const res = await api.post(
    `/trainings/${trainingId}/assign/${employeeId}`
  );
  return res.data;
}

export async function markTrainingCompleted(employeeId: string, trainingId: string): Promise<void> {
  return await api.post(`/employees/${employeeId}/complete-training/${trainingId}`);
}

// Reports API endpoints

//Risk reports API endpoints
export async function riskReportExportCsv(companyId: number): Promise<Blob> {
  const res = await api.get(`/risks/export/csv/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function riskReportExportPdf(companyId: number): Promise<Blob> {
  const res = await api.get(`/risks/export/pdf/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function riskReportExportPdfTable(companyId: number): Promise<Blob> {
  const res = await api.get(`/risks/export/pdf-table/${companyId}`, { responseType: 'blob' });
  return res.data;
}

//Asset reports API endpoints

export async function assetReportExportCsv(companyId: number): Promise<Blob> {
  const res = await api.get(`/assets/export/csv/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function assetReportExportPdf(companyId: number): Promise<Blob> {
  const res = await api.get(`/assets/export/pdf/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function assetReportExportPdfTable(companyId: number): Promise<Blob> {
  const res = await api.get(`/assets/export/pdf-table/${companyId}`, { responseType: 'blob' });
  return res.data;
}

// Audit logs reports API endpoints

export async function exportCsv(companyId: number): Promise<Blob> {
  const res = await api.get(`/audit-logs/export/csv/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function exportPdf(companyId: number): Promise<Blob> {
  const res = await api.get(`/audit-logs/export/pdf/${companyId}`, { responseType: 'blob' });
  return res.data;
}

export async function exportPdfTable(companyId: number): Promise<Blob> {
  const res = await api.get(`/audit-logs/export/pdf-table/${companyId}`, { responseType: 'blob' });
  return res.data;
}


// Reports API endpoints

export async function fetchCustomRiskReportPdf(
  companyId: number,
  sections: string[]
): Promise<Blob> {
  const response = await api.get(`/risks/export/pdf-table/${companyId}`, {
    params: { sections: sections.join(','), },
    responseType: 'blob',
  });
  return response.data;
}


export async function fetchCustomAssetReportPdf(
  companyId: number,
  sections: string[]
): Promise<Blob> {
  const response = await api.get(`/assets/export/pdf-table/${companyId}`, {
    params: { sections: sections.join(','), },
    responseType: 'blob',
  });
  return response.data;
}

export async function fetchCustomAuditReportPdf(
  companyId: number,
  sections: string[]
): Promise<Blob> {
  const response = await api.get(`/audit-logs/export/audit/pdf-table/${companyId}`, {
    params: { sections: sections.join(','), },
    responseType: 'blob',
  });
  return response.data;
}


// audit logs endpoints

export async function fetchAuditLogs(
  user?: string,
  action?: string,
  entity?: string,
  from?: string,
  to?: string
): Promise<AuditLog[]> {
  const params: any = {};
  if (user) params.user = user;
  if (action) params.action = action;
  if (entity) params.entity = entity;
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await api.get('/audit-logs', { params });
  return res.data;
}