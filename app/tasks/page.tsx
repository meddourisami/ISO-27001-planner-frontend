import TaskManager from "@/components/task-manager"
import { Providers } from "@/components/providers"

export default function TasksPage() {
  return (
    <main className="container py-10">
      <Providers>
        <TaskManager />
      </Providers>
    </main>
  )
}

