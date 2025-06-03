import RiskAssessment from "@/components/risk-assessment"
import { Providers } from "@/components/providers"

export default function RisksPage() {
  return (
    <main className="container py-10">
      <Providers>
        <RiskAssessment />
      </Providers>
    </main>
  )
}

