import { Contract, nativeToScVal, scValToNative, Account, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'

const CONTRACT_ID = 'CADJC5Y7UVWIQ72ENKWF3N7ZIKIEU3I75G6SABPGZZUEWURBRRH6ZQST'
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'

type Signer = (xdr: string, options?: { networkPassphrase?: string }) => Promise<{ signedTxXdr: string }>

async function simulateRead(method: string, user: string): Promise<bigint> {
  const server = new Server(RPC_URL)
  const source = new Account(user, '0')

  const operation = new Contract(CONTRACT_ID).call(
    method,
    nativeToScVal(user, { type: 'address' }),
  )

  const tx = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)

  if (!Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error('Simulation failed or returned no result')
  }

  return scValToNative(sim.result.retval) as bigint
}

async function buildAndSend(
  user: string,
  method: string,
  args: xdr.ScVal[],
  signTransaction: Signer,
): Promise<string> {
  const server = new Server(RPC_URL)

  const source = await server.getAccount(user)

  const operation = new Contract(CONTRACT_ID).call(method, ...args)

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

  const envelopeXdr = prepared.toEnvelope().toXDR('base64')
  let signedTxXdr: string
  try {
    const res = await signTransaction(envelopeXdr, { networkPassphrase: NETWORK_PASSPHRASE })
    signedTxXdr = res.signedTxXdr
  } catch (err) {
    if (err instanceof Error && /rejected|cancelled|cancel/i.test(err.message)) {
      throw new Error('Transaction cancelled')
    }
    throw err
  }

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)

  const result = await server.sendTransaction(signedTx)
  if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
    const txStatus = await server.pollTransaction(result.hash, { attempts: 15 })
    if (txStatus.status === Api.GetTransactionStatus.SUCCESS) {
      return result.hash
    }
    throw new Error('Transaction failed on-chain')
  }

  let errorName: string = result.status
  if (result.errorResult) {
    try {
      errorName = result.errorResult.result().switch().name as string
    } catch {
      errorName = result.status as string
    }
  }
  throw new Error(`Transaction rejected: ${errorName}`)
}

export async function getCollateral(user: string): Promise<bigint> {
  return simulateRead('get_collateral', user)
}

export async function getDebt(user: string): Promise<bigint> {
  return simulateRead('get_debt', user)
}

export async function deposit(
  user: string,
  amount: bigint,
  signTransaction: Signer,
): Promise<string> {
  return buildAndSend(user, 'deposit', [
    nativeToScVal(user, { type: 'address' }),
    nativeToScVal(amount, { type: 'i128' }),
  ], signTransaction)
}

export async function withdraw(
  user: string,
  amount: bigint,
  signTransaction: Signer,
): Promise<string> {
  return buildAndSend(user, 'withdraw', [
    nativeToScVal(user, { type: 'address' }),
    nativeToScVal(amount, { type: 'i128' }),
  ], signTransaction)
}

export const networks = {
  testnet: {
    networkPassphrase: NETWORK_PASSPHRASE,
    contractId: CONTRACT_ID,
  },
}
