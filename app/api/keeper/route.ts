import { NextResponse } from 'next/server'
import {
  Contract,
  nativeToScVal,
  Keypair,
  Account,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

const CONTRACT_ID = process.env.CONTRACT_ID || ''
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const YIELD_AMOUNT = BigInt('20000000') // 2 USDC in stroops (7 decimals)

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

  try {
    const db = getAdminFirestore()
    const snapshot = await db
      .collection('invoices')
      .where('status', '==', 'paid')
      .get()

    const addressSet = new Set<string>()
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.buyerAddress) addressSet.add(data.buyerAddress)
    })

    const addresses = [...addressSet]

    if (!addresses.length) {
      return NextResponse.json({
        status: 'idle',
        message: 'No active debts to process.',
        addresses: 0,
      })
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

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      status: 'completed',
      addresses: addresses.length,
      succeeded,
      failed,
      results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 })
  }
}
