import { NextResponse } from 'next/server'
import {
  Contract,
  nativeToScVal,
  Keypair,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'
import { Timestamp } from 'firebase-admin/firestore'
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'
import { getDebt } from '@/lib/contract'

const CONTRACT_ID = process.env.CONTRACT_ID || ''
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const YIELD_AMOUNT = BigInt('20000000')
const LOCK_REF = adminDb.collection('locks').doc('keeper')
const LOCK_TIMEOUT_MS = 10 * 60 * 1000

async function acquireLock(): Promise<boolean> {
  try {
    await adminDb.runTransaction(async (transaction) => {
      const snap = await transaction.get(LOCK_REF) as DocumentSnapshot
      if (snap.exists) {
        const d = snap.data()
        if (d?.locked && d.expiresAt?.toMillis?.() > Date.now()) {
          throw new Error('LOCK_ACQUIRED')
        }
      }
      transaction.set(LOCK_REF, {
        locked: true,
        expiresAt: Timestamp.fromMillis(Date.now() + LOCK_TIMEOUT_MS),
      })
    })
    return true
  } catch {
    return false
  }
}

async function releaseLock() {
  await LOCK_REF.set({ locked: false, expiresAt: Timestamp.fromMillis(0) })
}

async function withRetry(fn: () => Promise<void>, retries = 2): Promise<void> {
  for (let i = 0; i <= retries; i++) {
    try {
      await fn()
      return
    } catch (err) {
      const isTransient = err instanceof Error && /bad_seq|tx_bad_seq|network|timeout|fetch/i.test(err.message)
      if (!isTransient || i >= retries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

async function offsetDebtForUser(userAddress: string): Promise<void> {
  const debt = await getDebt(userAddress)
  if (debt <= BigInt(0)) return

  const amount = debt < YIELD_AMOUNT ? debt : YIELD_AMOUNT

  const server = new Server(RPC_URL)
  const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY!)
  const source = await server.getAccount(adminKeypair.publicKey())

  const operation = new Contract(CONTRACT_ID).call(
    'offset_debt',
    nativeToScVal(userAddress, { type: 'address' }),
    nativeToScVal(amount, { type: 'i128' }),
  )

  const tx = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)
  if (!Api.isSimulationSuccess(sim)) {
    const errMsg = 'error' in sim ? sim.error : 'Simulation failed'
    throw new Error(errMsg)
  }

  const prepared = await server.prepareTransaction(tx)
  prepared.sign(adminKeypair)

  const result = await server.sendTransaction(prepared)
  if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
    await server.pollTransaction(result.hash, { attempts: 15 })
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'ADMIN_SECRET_KEY not configured' }, { status: 500 })
  }

  const locked = await acquireLock()
  if (!locked) {
    return NextResponse.json({ error: 'Another keeper run is in progress' }, { status: 409 })
  }

  const summary: Record<string, unknown> = {}

  try {
    const expiredSnapshot = await adminDb
      .collection('invoices')
      .where('status', '==', 'pending')
      .where('expiresAt', '<', Timestamp.now())
      .get()

    let expiredCount = 0
    if (expiredSnapshot.size > 0) {
      const batch = adminDb.batch()
      expiredSnapshot.forEach((d: QueryDocumentSnapshot) => {
        batch.update(d.ref, { status: 'expired' })
        expiredCount++
      })
      await batch.commit()
    }

    summary.expiredInvoices = expiredCount
  } catch (err) {
    summary.expireError = err instanceof Error ? err.message : 'Unknown error'
  }

  try {
    const paidSnapshot = await adminDb
      .collection('invoices')
      .where('status', '==', 'paid')
      .get()

    const addressSet = new Set<string>()
    paidSnapshot.forEach((d: QueryDocumentSnapshot) => {
      const data = d.data() as { buyerAddress?: string }
      if (data.buyerAddress) addressSet.add(data.buyerAddress)
    })

    const addresses = [...addressSet]

    if (!addresses.length) {
      summary.offsetStatus = 'idle'
      summary.offsetAddresses = 0
      await releaseLock()
      return NextResponse.json(summary)
    }

    const settled = await Promise.allSettled(
      addresses.map(async (address) => {
        await withRetry(() => offsetDebtForUser(address))
        return address
      }),
    )

    const succeeded: string[] = []
    const failed: { address: string; error: string }[] = []

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value)
      } else {
        const idx = settled.indexOf(result)
        const address = idx >= 0 ? addresses[idx] : 'unknown'
        failed.push({ address, error: result.reason instanceof Error ? result.reason.message : 'Unknown error' })
      }
    }

    summary.offsetStatus = 'completed'
    summary.offsetAddresses = addresses.length
    summary.offsetSucceeded = succeeded.length
    summary.offsetFailed = failed.length
    if (failed.length) summary.offsetFailedDetails = failed
  } catch (err) {
    summary.offsetError = err instanceof Error ? err.message : 'Unknown error'
  }

  await releaseLock()
  return NextResponse.json(summary)
}
