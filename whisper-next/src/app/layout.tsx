import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import Toast from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Whisper — Podeli svoju priču',
  description: 'Anonimna zajednica za ispovesti',
}

export const viewport: Viewport = {
  themeColor: '#0E0E0F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body suppressHydrationWarning>
        <StoreProvider>
          <div style={{ width: '100%', maxWidth: 'var(--max-w)', minHeight: '100dvh', position: 'relative', background: 'var(--bg)', overflow: 'hidden', margin: '0 auto' }}>
            {children}
          </div>
          <Toast />
        </StoreProvider>
      </body>
    </html>
  )
}
