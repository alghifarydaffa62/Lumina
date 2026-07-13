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

  const { runQuery, commit, beginTransaction, rollbackTransaction } = await import('@/lib/firestore-rest')

  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''
  const LOCK_PATH = 'locks/keeper'

  async function releaseLock() {
    await commit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/${LOCK_PATH}`,
          fields: { locked: { booleanValue: false }, expiresAt: { timestampValue: new Date(0).toISOString() } },
        },
      },
    ])
  }

  async function tryAcquireLock(): Promise<boolean> {
    const txnId = await beginTransaction()
    try {
      const { getDocument, fieldsToObject } = await import('@/lib/firestore-rest')

      const existing = await getDocument(LOCK_PATH)
      if (existing) {
        const data = fieldsToObject<{ locked?: boolean; expiresAt?: string }>(existing.fields as Record<string, unknown>)
        if (data.locked && data.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
          await rollbackTransaction(txnId)
          return false
        }
      }

      const docName = `projects/${PROJECT_ID}/databases/(default)/documents/${LOCK_PATH}`
      await commit([
        {
          update: {
            name: docName,
            fields: {
              locked: { booleanValue: true },
              expiresAt: { timestampValue: new Date(Date.now() + LOCK_TIMEOUT_MS).toISOString() },
            },
          },
        },
      ], txnId)
      return true
    } catch {
      try { await rollbackTransaction(txnId) } catch {}
      return false
    }
  }

  const locked = await tryAcquireLock()
  if (!locked) {
    return NextResponse.json({ error: 'Another keeper run is in progress' }, { status: 409 })
  }

  const summary: Record<string, unknown> = {}

  try {
    const { fieldsToObject } = await import('@/lib/firestore-rest')

    try {
      const expiredDocs = await runQuery('invoices', [
        { field: 'status', op: 'EQUAL', value: 'pending' },
        { field: 'expiresAt', op: 'LESS_THAN', value: new Date() },
      ])

      if (expiredDocs.length > 0) {
        const writes = expiredDocs.map((doc) => ({
          update: {
            name: doc.name,
            fields: { status: { stringValue: 'expired' } },
          },
        }))
        await commit(writes)
      }

      summary.expiredInvoices = expiredDocs.length
    } catch (err) {
      summary.expireError = err instanceof Error ? err.message : String(err)
    }

    try {
      const paidDocs = await runQuery('invoices', [
        { field: 'status', op: 'EQUAL', value: 'paid' },
      ])

      const addressSet = new Set<string>()
      const paidNames: string[] = []

      for (const doc of paidDocs) {
        const data = fieldsToObject<{ buyerAddress?: string }>(doc.fields as Record<string, unknown>)
        if (data.buyerAddress) {
          addressSet.add(data.buyerAddress)
          paidNames.push(doc.name)
        }
      }

      const addresses = [...addressSet]

      if (addresses.length === 0) {
        summary.offsetStatus = 'idle'
        summary.offsetAddresses = 0
      } else {
        let offsetSucceeded = 0
        let offsetFailed = 0
        const offsetErrors: { address: string; error: string }[] = []

        for (const address of addresses) {
          try {
            const { getDebt } = await import('@/lib/contract')
            const debt = await getDebt(address)
            if (debt <= BigInt(0)) {
              offsetSucceeded++
              continue
            }

            const amount = debt < YIELD_AMOUNT ? debt : YIELD_AMOUNT

            const server = new Server(RPC_URL)
            const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY!)
            const source = await server.getAccount(adminKeypair.publicKey())

            const operation = new Contract(CONTRACT_ID).call(
              'offset_debt',
              nativeToScVal(address, { type: 'address' }),
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

            offsetSucceeded++
          } catch (err) {
            offsetFailed++
            offsetErrors.push({ address, error: err instanceof Error ? err.message : String(err) })
          }
        }

        summary.offsetStatus = 'completed'
        summary.offsetAddresses = addresses.length
        summary.offsetSucceeded = offsetSucceeded
        summary.offsetFailed = offsetFailed
        if (offsetErrors.length) summary.offsetErrors = offsetErrors

        if (offsetSucceeded > 0) {
          try {
            const writes = paidNames.map((name) => ({
              update: {
                name,
                fields: { status: { stringValue: 'settled' } },
              },
            }))
            await commit(writes)
            summary.settledInvoices = paidNames.length
          } catch (err) {
            summary.settleError = err instanceof Error ? err.message : String(err)
          }
        }
      }
    } catch (err) {
      summary.offsetError = err instanceof Error ? err.message : String(err)
    }
  } finally {
    try { await releaseLock() } catch {}
  }

  return NextResponse.json(summary)
}
