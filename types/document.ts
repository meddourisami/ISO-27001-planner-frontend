export interface DocumentDto {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  version: string;
  owner: string;
  approver: string;
  approvalDate: string;
  reviewDate: string;
  content: string;
  companyId: number;
}

export interface DocumentVersionDto {
  id: number;
  version: string;
  status: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  approver: string;
  approvalDate: string;
  uploadedAt: string;
  contentPreview?: string;
}