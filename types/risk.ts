export interface RiskDto {
    id?: string;
    title: string;
    description: string;
    asset: string;
    threat: string;
    vulnerability: string;
    likelihood: string;
    impact: string;
    severity: string;
    status: string;
    owner: string;
    treatment: string;
    controls: string;
    dueDate: string;
    companyId: number;
}