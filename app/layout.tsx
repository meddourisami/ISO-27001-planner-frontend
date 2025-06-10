import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ISO 27001 Planner",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Prevent HTML caching for stale chunk protection */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* Optional: chunk error auto-fix */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function (e) {
                const target = e?.target || {};
                if (
                  (e?.message && e.message.includes('Loading chunk')) ||
                  (target?.src && target.src.includes('_next/static/chunks'))
                ) {
                  console.warn("Stale chunk detected, reloading...");
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body>
          <Providers>
            <main>{children}</main>
            <Toaster />
          </Providers>
      </body>
    </html>
  )
}