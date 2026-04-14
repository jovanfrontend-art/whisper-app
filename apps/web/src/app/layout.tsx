import type { Metadata, Viewport } from 'next'
import './globals.css'
import WebStoreProvider from '@/components/WebStoreProvider'
import Toast from '@/components/ui/Toast'
import ServiceWorkerRegister from '@/components/ui/ServiceWorkerRegister'
import Preloader from '@/components/ui/Preloader'

export const metadata: Metadata = {
  title: 'WhisperX — Podeli svoju priču',
  description: 'Anonimna zajednica za ispovesti',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WhisperX',
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
        <WebStoreProvider>
          <Preloader />
          <div className="app-wrapper">
            {children}
          </div>
          <Toast />
          <ServiceWorkerRegister />
        </WebStoreProvider>
      </body>
    </html>
  )
}
