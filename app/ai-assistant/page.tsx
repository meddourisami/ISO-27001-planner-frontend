import { Providers } from "@/components/providers"
import AIAssistant from "@/components/ai-assistant"

export default function AIAssistantPage() {
  return (
    <main className="container py-10">
      <Providers>
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <AIAssistant />
      </Providers>
    </main>
  )
}

