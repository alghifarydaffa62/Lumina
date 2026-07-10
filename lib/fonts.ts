import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'

export const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-display-family',
  display: 'swap',
})

export const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body-family',
  display: 'swap',
})

export const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono-family',
  display: 'swap',
})