import { Open_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const openSans = Open_Sans({ subsets: ['latin'] })

export const metadata = {
  title: 'Ableman Property Deals',
  description: 'Find the best property deals with Ableman Group LLC',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
    {
      rel: 'icon',
      url: '/favicon.png',
      type: 'image/png',
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={openSans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}