import { NextResponse } from 'next/server'
import { Transaction, Keypair, Networks } from '@stellar/stellar-sdk'
import { getAdminAuth } from '@/lib/firebase-admin'
import crypto from 'node:crypto'

const AUTH_SECRET = crypto.randomUUID()
const NONCE_TTL_MS = 120_000

function createChallenge() {
  const nonce = crypto.randomBytes(8).toString('hex')
  const expiry = Date.now() + NONCE_TTL_MS
  const payload = `${nonce}:${expiry}`
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex')
  return { nonce, challenge: `${nonce}:${expiry}:${sig}` }
}

function verifyChallenge(challenge: string): string | null {
  const lastColon = challenge.lastIndexOf(':')
  const secondLastColon = challenge.lastIndexOf(':', lastColon - 1)
  if (lastColon < 0 || secondLastColon < 0) return null

  const expiry = Number(challenge.slice(secondLastColon + 1, lastColon))
  const sig = challenge.slice(lastColon + 1)
  const nonce = challenge.slice(0, secondLastColon)

  if (Date.now() > expiry) return null

  const payload = `${nonce}:${expiry}`
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex')
  if (sig !== expected) return null

  return nonce
}

export async function GET() {
  const { nonce, challenge } = createChallenge()
  return NextResponse.json({ nonce, challenge })
}

export async function POST(request: Request) {
  try {
    const { signedTxXdr, challenge } = await request.json()

    if (!signedTxXdr || !challenge) {
      return NextResponse.json({ error: 'Missing signedTxXdr or challenge' }, { status: 400 })
    }

    const nonce = verifyChallenge(challenge)
    if (!nonce) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 401 })
    }

    const tx = new Transaction(signedTxXdr, Networks.TESTNET)

    const memoType = tx.memo?.type ?? 'none'
    if (memoType !== 'text') {
      return NextResponse.json({ error: 'Expected text memo' }, { status: 401 })
    }

    const memoVal = tx.memo!.value
    const memoStr = Buffer.isBuffer(memoVal) ? memoVal.toString() : String(memoVal)
    if (memoStr !== nonce) {
      return NextResponse.json({ error: 'Challenge mismatch' }, { status: 401 })
    }

    const sourceAddress = tx.source
    const txHash = tx.hash()
    const kp = Keypair.fromPublicKey(sourceAddress)

    const hasValidSig = tx.signatures.some((sig) => {
      try {
        return kp.verify(txHash, sig.signature())
      } catch {
        return false
      }
    })

    if (!hasValidSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const customToken = await getAdminAuth().createCustomToken(sourceAddress)

    return NextResponse.json({ token: customToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
