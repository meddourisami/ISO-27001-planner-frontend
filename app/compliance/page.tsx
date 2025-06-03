import ComplianceStatus from "@/components/compliance-status"
import { Providers } from "@/components/providers"

export default function CompliancePage() {
  return (
    <main className="container py-10">
      <Providers>
        <ComplianceStatus />
      </Providers>
    </main>
  )
}

