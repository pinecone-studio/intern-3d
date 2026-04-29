import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { RoleProvider } from '@/lib/role-context'
import { AppApolloProvider } from '@/components/providers/apollo-provider'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Academic TimeLine - Өрөө удирдлагын систем',
  description: 'Сургуулийн өрөө болон төхөөрөмжийн удирдлагын систем',
  generator: 'v0.app',
  other: {
    google: 'notranslate',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn" className="notranslate" suppressHydrationWarning translate="no">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppApolloProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </AppApolloProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
