import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StorySprout - Where Little Readers Grow',
  description: 'A mobile-first digital reading platform for children ages 2-10. Beautiful stories, curriculum-aligned content, and sight word learning.',
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
