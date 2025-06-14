export interface AssetDto {
  id: string
  name: string
  description: string
  type: string
  classification: string
  location: string
  status: string
  value: string
  vulnerabilities: string
  controls: string
  lastReview: string
  relatedRisks: string[]
  ownerEmail: string
  companyId: number
}