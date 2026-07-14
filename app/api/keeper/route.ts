import { NextResponse } from 'next/server'
import {
  Contract,
  nativeToScVal,
  Keypair,
  TransactionBuilder,
  Address,
} from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'
import crypto from 'node:crypto'

const CONTRACT_ID = process.env.CONTRACT_ID || ''
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const YIELD_AMOUNT = BigInt('20000000')
const LOCK_TIMEOUT_MS = 10 * 60 * 1000

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

  const { runQuery, commit, getDocument, fieldsToObject } = await import('@/lib/firestore-rest')

  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''
  const LOCK_PATH = 'locks/keeper'
  const lockRef = `projects/${PROJECT_ID}/databases/(default)/documents/${LOCK_PATH}`

  async function acquireLock(): Promise<boolean> {
    try {
      const existing = await getDocument(LOCK_PATH)
      if (existing) {
        const data = fieldsToObject<{ locked?: boolean; expiresAt?: string }>(existing.fields as Record<string, unknown>)
        if (data.locked && data.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
          return false
        }
      }
      await commit([
        {
          update: {
            name: lockRef,
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
    try {
      await commit([
        {
          update: {
            name: lockRef,
            fields: { locked: { booleanValue: false }, expiresAt: { timestampValue: new Date(0).toISOString() } },
          },
        },
      ])
    } catch {}
  }

  const locked = await acquireLock()
  const summary: Record<string, unknown> = { lockAcquired: locked }

  if (!locked) {
    return NextResponse.json(summary)
  }

  try {
    // Cleanup: delete corrupted invoices (status-only docs from old keeper bug)
    try {
      const allForCleanup = await runQuery('invoices', [])
      const corrupted = allForCleanup.filter((doc) => {
        const data = fieldsToObject(doc.fields as Record<string, unknown>) as Record<string, unknown>
        return data.status && !data.buyerAddress && !data.merchantAddress
      })
      if (corrupted.length > 0) {
        const deletes = corrupted.map((doc) => ({ delete: doc.name }))
        await commit(deletes)
      }
      summary.cleanupDeleted = corrupted.length
    } catch (err) {
      summary.cleanupError = err instanceof Error ? err.message : String(err)
    }

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
          updateMask: { fieldPaths: ['status'] },
        }))
        await commit(writes)
      }

      summary.expiredInvoices = expiredDocs.length
    } catch (err) {
      summary.expireError = err instanceof Error ? err.message : String(err)
    }

    try {
      const allDocs = await runQuery('invoices', [])

      // Group invoices by buyerAddress, track which ones are still 'paid'
      const addressToInvoices = new Map<string, { name: string; status: string }[]>()
      for (const doc of allDocs) {
        const data = fieldsToObject<{ buyerAddress?: string; status?: string }>(doc.fields as Record<string, unknown>)
        if (!data.buyerAddress) continue
        const list = addressToInvoices.get(data.buyerAddress) || []
        list.push({ name: doc.name, status: data.status || '' })
        addressToInvoices.set(data.buyerAddress, list)
      }

      const addresses = [...addressToInvoices.keys()]

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

            const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY!)

            let txSuccess = false
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                const server = new Server(RPC_URL)
                const source = await server.getAccount(adminKeypair.publicKey())

                const operation = new Contract(CONTRACT_ID).call(
                  'offset_debt',
                  new Address(address).toScVal(),
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

                const sendResult = await server.sendTransaction(prepared)

                if (sendResult.status === 'ERROR') {
                  const errMsg = sendResult.errorResult
                    ? String(sendResult.errorResult.result().switch().name)
                    : 'Transaction rejected'
                  throw new Error(errMsg)
                }

                if (sendResult.status === 'TRY_AGAIN_LATER') {
                  throw new Error('TRY_AGAIN_LATER')
                }

                if (sendResult.status === 'PENDING' || sendResult.status === 'DUPLICATE') {
                  const pollResult = await server.pollTransaction(sendResult.hash, { attempts: 15 })
                  if (pollResult.status === Api.GetTransactionStatus.FAILED) {
                    throw new Error('Transaction failed on-chain')
                  }
                }

                txSuccess = true
                break
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                const isSeqErr = /bad_seq|tx_bad_seq|sequence/i.test(msg)
                const isTryAgain = /try_again_later|timeout|network/i.test(msg)
                if ((isSeqErr || isTryAgain) && attempt < 2) {
                  await new Promise((r) => setTimeout(r, 1000))
                  continue
                }
                throw err
              }
            }

            if (txSuccess) {
              offsetSucceeded++

              // Mark this address's paid invoices as settled
              const invoices = addressToInvoices.get(address) || []
              const paidNames = invoices.filter((i) => i.status === 'paid').map((i) => i.name)
              if (paidNames.length > 0) {
                try {
                  const writes = paidNames.map((name) => ({
                    update: {
                      name,
                      fields: { status: { stringValue: 'settled' } },
                    },
                    updateMask: { fieldPaths: ['status'] },
                  }))
                  await commit(writes)
                  summary.settledInvoices = (summary.settledInvoices as number || 0) + paidNames.length
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err)
                  summary.settleError = summary.settleError
                    ? `${summary.settleError}; ${msg}`
                    : msg
                }
              }
            }
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
      }
    } catch (err) {
      summary.offsetError = err instanceof Error ? err.message : String(err)
    }
  } finally {
    await releaseLock()
  }

  return NextResponse.json(summary)
}
