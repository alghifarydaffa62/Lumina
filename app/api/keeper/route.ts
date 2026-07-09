import { NextResponse } from 'next/server'
import {
  Contract,
  nativeToScVal,
  Keypair,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

const CONTRACT_ID = process.env.CONTRACT_ID || ''
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const YIELD_AMOUNT = BigInt('20000000')

function getAdminFirestore() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

async function offsetDebtForUser(userAddress: string): Promise<void> {
  const server = new Server(RPC_URL)
  const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET_KEY!)
  const source = await server.getAccount(adminKeypair.publicKey())

  const operation = new Contract(CONTRACT_ID).call(
    'offset_debt',
    nativeToScVal(userAddress, { type: 'address' }),
    nativeToScVal(YIELD_AMOUNT, { type: 'i128' }),
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

  const db = getAdminFirestore()
  const summary: Record<string, unknown> = {}

  try {
    // --- Part 1: Expire overdue invoices ---
    const expiredSnapshot = await db
      .collection('invoices')
      .where('status', '==', 'pending')
      .where('expiresAt', '<', new Date())
      .get()

    let expiredCount = 0
    const batch = db.batch()
    expiredSnapshot.forEach((doc) => {
      batch.update(doc.ref, { status: 'expired' })
      expiredCount++
    })
    if (expiredCount > 0) await batch.commit()

    summary.expiredInvoices = expiredCount
  } catch (err) {
    summary.expireError = err instanceof Error ? err.message : 'Unknown error'
  }

  try {
    // --- Part 2: Offset debt for users with paid invoices ---
    const paidSnapshot = await db
      .collection('invoices')
      .where('status', '==', 'paid')
      .get()

    const addressSet = new Set<string>()
    paidSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.buyerAddress) addressSet.add(data.buyerAddress)
    })

    const addresses = [...addressSet]

    if (!addresses.length) {
      summary.offsetStatus = 'idle'
      summary.offsetAddresses = 0
      return NextResponse.json(summary)
    }

    const results: { address: string; success: boolean; error?: string }[] = []

    for (const address of addresses) {
      try {
        await offsetDebtForUser(address)
        results.push({ address, success: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        results.push({ address, success: false, error: msg })
      }
    }

    summary.offsetStatus = 'completed'
    summary.offsetAddresses = addresses.length
    summary.offsetSucceeded = results.filter((r) => r.success).length
    summary.offsetFailed = results.filter((r) => !r.success).length
  } catch (err) {
    summary.offsetError = err instanceof Error ? err.message : 'Unknown error'
  }

  return NextResponse.json(summary)
}
