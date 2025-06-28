import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Portal System',
  description: 'Job Portal System App',
  generator: 'Next.js', // Optional: update if you used v0.dev to generate this
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
