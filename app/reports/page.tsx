import { Providers } from "@/components/providers"
import ReportGenerator from "@/components/report-generator"

export default function ReportsPage() {
  return (
    <main className="container py-10">
      <Providers>
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        <ReportGenerator />
      </Providers>
    </main>
  )
}