export interface RiskDto {
    id?: string;
    title: string;
    description: string;
    assetId: string;
    threat: string;
    vulnerability: string;
    likelihood: string;
    impact: string;
    severity: string;
    status: string;
    ownerEmail: string;
    treatment: string;
    controls: string;
    dueDate: string;
    companyId: number;
}