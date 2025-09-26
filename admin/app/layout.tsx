import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Star Eye Solutions',
  description: 'admin',
  generator: 'admin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body>{children}</body>
    </html>
  )
}
