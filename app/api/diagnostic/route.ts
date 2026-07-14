import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

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

  const report: Record<string, any> = {}

  // 1. Env vars check
  let saProjectId = '(unable to parse)'
  try {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64
    if (b64) {
      const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
      saProjectId = parsed.project_id || '(not in service account)'
    }
  } catch {}
  report.env = {
    CONTRACT_ID_set: !!process.env.CONTRACT_ID,
    NEXT_PUBLIC_CONTRACT_ID_set: !!process.env.NEXT_PUBLIC_CONTRACT_ID,
    adminKeySet: !!process.env.ADMIN_SECRET_KEY,
    cronSecretSet: !!process.env.CRON_SECRET,
    authSecretSet: !!process.env.AUTH_SECRET,
    projectIdSet: !!process.env.FIREBASE_PROJECT_ID,
    serviceAccountB64Set: !!process.env.FIREBASE_SERVICE_ACCOUNT_B64,
    CONTRACT_ID_value: process.env.CONTRACT_ID || '(not set)',
    NEXT_PUBLIC_CONTRACT_ID_value: process.env.NEXT_PUBLIC_CONTRACT_ID || '(not set)',
    FIREBASE_PROJECT_ID_value: process.env.FIREBASE_PROJECT_ID || '(not set)',
    SERVICE_ACCOUNT_PROJECT_ID: saProjectId,
  }

  // 2. Firestore test
  try {
    const { commit, getDocument, fieldsToObject, runQuery } = await import('@/lib/firestore-rest')
    report.firestore = {}

    // Test write
    try {
      await commit([
        {
          update: {
            name: `projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/diagnostic/test`,
            fields: { timestamp: { timestampValue: new Date().toISOString() } },
          },
        },
      ])
      report.firestore.write = 'ok'
    } catch (err) {
      report.firestore.write = err instanceof Error ? err.message : String(err)
    }

    // Test read
    try {
      const doc = await getDocument('diagnostic/test')
      report.firestore.read = doc ? 'ok' : 'not found'
    } catch (err) {
      report.firestore.read = err instanceof Error ? err.message : String(err)
    }

    // Lock doc
    try {
      const lock = await getDocument('locks/keeper')
      if (lock) {
        report.firestore.lock = fieldsToObject(lock.fields as Record<string, unknown>)
      } else {
        report.firestore.lock = '(not found)'
      }
    } catch (err) {
      report.firestore.lock = err instanceof Error ? err.message : String(err)
    }

    // Invoice breakdown
    try {
      const allDocs = await runQuery('invoices', [])
      const counts: Record<string, number> = {}
      const byAddress: Record<string, { count: number; statuses: string[]; sampleId: string }> = {}
      for (const d of allDocs) {
        const data = fieldsToObject<{ status?: string; buyerAddress?: string; merchantAddress?: string }>(d.fields as Record<string, unknown>)
        const s = data.status || 'unknown'
        counts[s] = (counts[s] || 0) + 1

        const addr = data.buyerAddress || `merchant:${data.merchantAddress || 'unknown'}`
        if (!byAddress[addr]) byAddress[addr] = { count: 0, statuses: [], sampleId: d.name.split('/').pop() || '' }
        byAddress[addr].count++
        if (!byAddress[addr].statuses.includes(s)) byAddress[addr].statuses.push(s)

        // Limit to 20 docs to avoid huge response
        if (allDocs.length <= 20) {
          const shortName = d.name.split('/').pop() || ''
          if (!report.firestore.invoiceSamples) report.firestore.invoiceSamples = []
          ;(report.firestore.invoiceSamples as any[]).push({
            id: shortName,
            status: s,
            buyerAddress: data.buyerAddress || '(not set)',
            merchantAddress: data.merchantAddress || '(not set)',
          })
        }
      }
      report.firestore.invoiceCounts = counts
      report.firestore.invoiceByAddress = byAddress
    } catch (err) {
      report.firestore.invoiceCounts = err instanceof Error ? err.message : String(err)
    }
  } catch (err) {
    report.firestore = { error: err instanceof Error ? err.message : String(err) }
  }

  // 3. Soroban test
  try {
    report.soroban = {}
    const contractId = process.env.CONTRACT_ID || ''
    report.soroban.contractIdUsed = contractId

    const { Server } = await import('@stellar/stellar-sdk/rpc')
    const server = new Server('https://soroban-testnet.stellar.org')

    // Test RPC health
    try {
      const health = await server.getHealth()
      report.soroban.rpcHealth = health
    } catch (err) {
      report.soroban.rpcHealth = err instanceof Error ? err.message : String(err)
    }

    // Test getDebt for a known address
    const { getDebt } = await import('@/lib/contract')
    const testAddress = request.headers.get('x-test-address') || ''
    if (testAddress) {
      try {
        const debt = await getDebt(testAddress)
        report.soroban.debtForTestAddress = debt.toString()
      } catch (err) {
        report.soroban.debtForTestAddress = err instanceof Error ? err.message : String(err)
      }
    } else {
      report.soroban.debtForTestAddress = '(pass x-test-address header to check)'
    }
  } catch (err) {
    report.soroban = { error: err instanceof Error ? err.message : String(err) }
  }

  // 4. Firebase Custom Token test
  try {
    const { createFirebaseCustomToken } = await import('@/lib/firebase-admin')
    const token = await createFirebaseCustomToken('diagnostic-test')
    report.firebaseToken = { generated: true, tokenPrefix: token.substring(0, 20) + '...' }
  } catch (err) {
    report.firebaseToken = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(report)
}
