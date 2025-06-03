import AuditPlanner from "@/components/audit-planner"
import { Providers } from "@/components/providers"

export default function AuditsPage() {
  return (
    <main className="container py-10">
      <Providers>
        <AuditPlanner />
      </Providers>
    </main>
  )
}

