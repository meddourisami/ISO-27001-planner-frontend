import { AssetDto, AuditDto, DocumentDto, DocumentVersionDto, RiskDto, TaskDto, User } from "@/types";
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

export async function fetchDocuments(companyId: number): Promise<DocumentDto[]> {
  return (await api.get(`/companies/${companyId}/documents`)).data;
}

export async function createDocumentWithFile(dto: DocumentDto, file: File): Promise<DocumentDto> {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  form.append("file", file);
  return (await api.post(`/documents`, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
}

export async function uploadNewVersion(id: string, version: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  return (await api.put(`/documents/${id}/upload`, form, { params: { version } })).data;
}

export async function getVersionHistory(documentId: string): Promise<DocumentVersionDto[]> {
  const res = await api.get(`/documents/${documentId}/versions`);
  return res.data;
}

// Download specific version
export async function downloadVersion(versionId: number): Promise<Blob> {
  const res = await api.get(`/documents/download/${versionId}`, { responseType: "blob" });
  return res.data;
}

export async function searchVersions(query: string): Promise<DocumentVersionDto[]> {
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