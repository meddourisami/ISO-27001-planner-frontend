import DocumentManagement from "@/components/document-management"
import { Providers } from "@/components/providers"

export default function DocumentsPage() {
  return (
    <main className="container py-10">
      <Providers>
        <DocumentManagement />
      </Providers>
    </main>
  )
}

