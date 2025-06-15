export interface NonConformityDto {
  id?: string;
  title: string;
  description: string;
  source: string;
  sourceReference: string;
  dateIdentified: string;
  severity: string;
  status: string;
  owner: string;
  dueDate: string;
  relatedControls: string[];
  relatedRisks: string[];
  correctiveActions: string;
  evidence: string;
  verificationStatus: string;
  verificationDate?: string;
  verifiedBy?: string;
  comments?: string;
  companyId: number;
}