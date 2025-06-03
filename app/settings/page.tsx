import { Providers } from "@/components/providers"
import SettingsManagement from "@/components/settings-management"

export default function SettingsPage() {
  return (
    <main className="container py-10">
      <Providers>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <SettingsManagement />
      </Providers>
    </main>
  )
}

