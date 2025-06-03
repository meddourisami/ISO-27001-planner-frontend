import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'ISO 27001 Planner',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
