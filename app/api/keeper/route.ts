import { NextResponse } from 'next/server'
import {
  Contract,
  nativeToScVal,
  Keypair,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'
import crypto from 'node:crypto'

const CONTRACT_ID = process.env.CONTRACT_ID || ''
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const YIELD_AMOUNT = BigInt('20000000')
const LOCK_TIMEOUT_MS = 10 * 60 * 1000

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
  const { getDebt } = await import('@/lib/contract')
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

  if (!cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const expected = `Bearer ${cronSecret}`
  if (
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'ADMIN_SECRET_KEY not configured' }, { status: 500 })
  }
  if (!process.env.CONTRACT_ID) {
    return NextResponse.json({ error: 'CONTRACT_ID not configured' }, { status: 500 })
  }

  const { runQuery, commit, getDocument } = await import('@/lib/firestore-rest')

  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''

  async function acquireLock(): Promise<boolean> {
    const lockPath = `locks/keeper`
    try {
      const existing = await getDocument(lockPath)
      if (existing) {
        const { fieldsToObject } = await import('@/lib/firestore-rest')
        const data = fieldsToObject<{ locked?: boolean; expiresAt?: string }>(existing.fields as Record<string, unknown>)
        if (data.locked && data.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
          return false
        }
      }

      await commit([
        {
          update: {
            name: `projects/${PROJECT_ID}/databases/(default)/documents/${lockPath}`,
            fields: {
              locked: { booleanValue: true },
              expiresAt: { timestampValue: new Date(Date.now() + LOCK_TIMEOUT_MS).toISOString() },
            },
          },
        },
      ])
      return true
    } catch {
      return false
    }
  }

  async function releaseLock() {
    await commit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/locks/keeper`,
          fields: {
            locked: { booleanValue: false },
            expiresAt: { timestampValue: new Date(0).toISOString() },
          },
        },
      },
    ])
  }

  const locked = await acquireLock()
  if (!locked) {
    return NextResponse.json({ error: 'Another keeper run is in progress' }, { status: 409 })
  }

  const summary: Record<string, unknown> = {}

  try {
    const expiredDocs = await runQuery('invoices', [
      { field: 'status', op: 'EQUAL', value: 'pending' },
      { field: 'expiresAt', op: 'LESS_THAN', value: new Date() },
    ])

    let expiredCount = 0
    if (expiredDocs.length > 0) {
      const expiredWrites = expiredDocs.map((doc) => ({
        update: {
          name: doc.name,
          fields: { status: { stringValue: 'expired' } },
        },
      }))
      await commit(expiredWrites)
      expiredCount = expiredDocs.length
    }

    summary.expiredInvoices = expiredCount
  } catch (err) {
    summary.expireError = err instanceof Error ? err.message : 'Unknown error'
  }

  try {
    const paidDocs = await runQuery('invoices', [
      { field: 'status', op: 'EQUAL', value: 'paid' },
    ])

    const { fieldsToObject } = await import('@/lib/firestore-rest')

    const addressSet = new Set<string>()
    for (const doc of paidDocs) {
      const data = fieldsToObject<{ buyerAddress?: string }>(doc.fields as Record<string, unknown>)
      if (data.buyerAddress) addressSet.add(data.buyerAddress)
    }

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
