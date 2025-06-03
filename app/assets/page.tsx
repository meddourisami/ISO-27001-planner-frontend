import AssetsManagement from "@/components/assets-management"
import { Providers } from "@/components/providers"

export default function AssetsPage() {
  return (
    <main className="container py-10">
      <Providers>
        <AssetsManagement />
      </Providers>
    </main>
  )
}

