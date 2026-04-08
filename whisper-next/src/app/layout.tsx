import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import Toast from '@/components/ui/Toast'
import ServiceWorkerRegister from '@/components/ui/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'Whisper — Podeli svoju priču',
  description: 'Anonimna zajednica za ispovesti',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whisper',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF9500',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <ServiceWorkerRegister />
        </StoreProvider>
      </body>
    </html>
  )
}
