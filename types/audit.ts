export interface AuditDto {
  id?: string;
  title: string;
  description: string;
  type: string;
  scope: string;
  date: string;
  endDate: string;
  status: string;
  auditor: string;
  findings: string;
  nonConformities: number;
  observations: number;
  recommendations: number;
  companyId: number;
}