import TrainingManagement from "@/components/training-management"
import { Providers } from "@/components/providers"

export default function TrainingPage() {
  return (
    <main className="container py-10">
      <Providers>
        <TrainingManagement />
      </Providers>
    </main>
  )
}

