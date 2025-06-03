import NonConformitiesManagement from "@/components/nonconformities-management"
import { Providers } from "@/components/providers"

export default function NonConformitiesPage() {
  return (
    <main className="container py-10">
      <Providers>
        <h1 className="text-3xl font-bold mb-6">Non-Conformities</h1>
        <NonConformitiesManagement />
      </Providers>
    </main>
  )
}

