import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RedFlagRadar - Detect Hidden Fees & Predatory Terms',
  description: 'AI-powered consumer protection app that helps you detect hidden fees, shady charges, and predatory terms in bills, estimates, and contracts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
