export interface DocumentDto {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  version: string;
  ownerEmail: string;
  approverEmail: string;
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