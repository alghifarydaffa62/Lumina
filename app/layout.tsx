import type { Metadata } from 'next'
import { displayFont, bodyFont, monoFont } from '@/lib/fonts'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumina — Debt that pays itself',
  description:
    'A Web3 credit card on Stellar/Soroban. Deposit collateral, spend USDC, and let protocol yield dissolve the debt in the background.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body className="font-body bg-obsidian text-bone">
        <div className="noise-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}