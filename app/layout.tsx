import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "America's Trusted Businesses",
  description: 'Find and review trusted businesses across America',
  icons: {
    icon: [
      { url: '/favicon/fav64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon/fav120.png', sizes: '120x120', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/fav180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}