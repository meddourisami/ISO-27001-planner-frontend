import { Providers } from "@/components/providers"
import AdminPage from "@components/AdminPage"

export default function adminPage() {
    return (
        <main className="container py-10">
            <Providers>
                <AdminPage />
            </Providers>
        </main>
    )
}

