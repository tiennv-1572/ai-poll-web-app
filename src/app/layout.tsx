import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Poll Voting - Create and Share Polls',
    template: '%s | Poll Voting',
  },
  description:
    'Create polls, gather votes, and view real-time results. Simple, fast, and collaborative poll voting application.',
  keywords: [
    'poll',
    'voting',
    'survey',
    'real-time results',
    'online poll',
    'poll creator',
  ],
  authors: [{ name: 'Poll Voting Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Poll Voting - Create and Share Polls',
    description: 'Create polls with real-time results and easy sharing',
    siteName: 'Poll Voting',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poll Voting - Create and Share Polls',
    description: 'Create polls with real-time results and easy sharing',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
