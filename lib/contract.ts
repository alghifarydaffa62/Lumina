import { Contract, nativeToScVal, scValToNative, Account, TransactionBuilder } from '@stellar/stellar-sdk'
import { Server, Api } from '@stellar/stellar-sdk/rpc'

const CONTRACT_ID = 'CADJC5Y7UVWIQ72ENKWF3N7ZIKIEU3I75G6SABPGZZUEWURBRRH6ZQST'
const RPC_URL = 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'

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

export async function getCollateral(user: string): Promise<bigint> {
  return simulateRead('get_collateral', user)
}

export async function getDebt(user: string): Promise<bigint> {
  return simulateRead('get_debt', user)
}

export const networks = {
  testnet: {
    networkPassphrase: NETWORK_PASSPHRASE,
    contractId: CONTRACT_ID,
  },
}
