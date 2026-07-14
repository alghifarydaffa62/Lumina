# Lumina

A credit-card-style decentralized application built on Stellar Soroban. Users deposit collateral (USDC), receive a credit line, spend against it, and repay automatically through a cron-based keeper system. Merchants can create invoices and receive on-chain payments.

**Live App:** [https://lumina-ten-opal.vercel.app](https://lumina-ten-opal.vercel.app)

**Smart Contract:** `CD2BRE5VRAQSXWZ6NSKPUKKS7RBZC2VMWDKOQQBRFZEWZDGWQYFJPB7M`

**Network:** Stellar Testnet (Soroban)

---

## Features

### For Users (Card Holders)

- **Collateral Vault** — Deposit and withdraw USDC as collateral for your credit line.
- **Credit Spending** — Spend USDC directly from your credit line (up to 70% Loan-to-Value).
- **Real-time Balances** — Collateral, active debt, and available credit update automatically.
- **Invoice Payments** — View and pay merchant invoices from your dashboard.
- **Transaction History** — Browse past paid and expired invoices.
- **Automated Debt Repayment** — A background keeper offsets a portion of your debt each cycle using protocol yield.

### For Merchants

- **Store Registration** — Register your store name on-chain.
- **Invoice Creation** — Create bills by entering a buyer's wallet address or scanning their QR code.
- **Payment Tracking** — Invoices update in real-time when paid.

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Smart Contract | Soroban (Stellar) |
| Wallet | Freighter / WalletConnect via stellar-wallet-kit |
| Database | Firestore (Google Cloud) |
| Auth | Firebase Auth (custom tokens via Stellar signatures) |
| Hosting | Vercel (serverless) |
| Styling | Tailwind CSS |

### Project Structure

```
app/
  api/
    firebase-auth/     JWT creation & Firebase custom token minting
    keeper/            Cron-job handler for debt offset & invoice expiry
    diagnostic/        Debugging endpoint
  dashboard/
    page.tsx           Main dashboard (credit health, LTV gauge)
    my-card/           Card page (balances, invoices, spend, transactions)
    vault/             Deposit & withdraw collateral
    transactions/      Transaction history
  merchant/
    dashboard/         Merchant dashboard, store registration
      create-bill/     Invoice creation with QR scanner
    page.tsx           Merchant landing page
components/
  my-card/             Card-related components (balances, invoices, spend, transactions)
  merchant/            Merchant components (invoice form, QR scanner)
  Navbar.tsx           Responsive landing navbar
hooks/
  useCard.ts           Card balances & actions
  useInvoices.ts       Invoice listing & payment
  useTransactions.ts   Transaction history
  useFirebaseAuth.ts   Firebase auth with Stellar wallet signatures
  useMerchantBilling.ts Invoice creation
  useMerchant.ts       Store registration
lib/
  contract.ts          Soroban smart contract interactions
  firebase-admin.ts    Server-side Firebase Admin (custom tokens, Firestore REST auth)
  firestore-rest.ts    Firestore REST API helpers (no SDK dependency)
  app-wallet.tsx       Wallet connector (stellar-wallet-kit)
  firebase.ts          Client-side Firebase initialization
  firebase-auth-context.tsx  React context for Firebase auth state
```

### Key Flows

#### Authentication

Lumina uses Stellar wallet signatures for Firebase authentication:

1. Client requests a challenge (nonce + HMAC signature) from `/api/firebase-auth`.
2. Client signs a Stellar transaction containing the nonce as a memo.
3. Server verifies the signature and mints a Firebase Custom Token.
4. Client signs in to Firebase with the custom token.

This ensures wallet ownership without requiring a separate password or private key.

#### Keeper (Debt Offset)

A serverless cron job runs every 15 minutes via cron-job.org:

1. Acquires a Firestore lock to prevent concurrent runs.
2. Expires overdue `pending` invoices.
3. Queries all invoices, groups by buyer address.
4. For each address with on-chain debt > 0, calls `offset_debt` on the Soroban contract (up to 2 USDC per cycle).
5. Marks processed invoices as `settled` in Firestore (using `updateMask` to preserve other fields).

#### Payment Flow

1. Merchant creates an invoice with buyer's wallet address, item description, and amount.
2. Invoice appears in the buyer's dashboard in real-time via Firestore `onSnapshot`.
3. Buyer clicks "Pay Now" — `spend()` is called on the Soroban contract.
4. On success, the invoice status updates to `paid` in Firestore.
5. Keeper eventually processes the paid invoice, offsetting debt.

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Stellar
CONTRACT_ID=CD2BRE5VRAQSXWZ6NSKPUKKS7RBZC2VMWDKOQQBRFZEWZDGWQYFJPB7M
NEXT_PUBLIC_CONTRACT_ID=CD2BRE5VRAQSXWZ6NSKPUKKS7RBZC2VMWDKOQQBRFZEWZDGWQYFJPB7M
ADMIN_SECRET_KEY=<stellar_secret_key_with_offset_debt_permission>

# Firebase
FIREBASE_SERVICE_ACCOUNT_B64=<base64_of_firebase_service_account_json>
FIREBASE_PROJECT_ID=lumina-e79aa

# Auth
AUTH_SECRET=<random_string_for_challenge_hmac>
CRON_SECRET=<secret_for_keeper_endpoint>

# Soroban RPC (optional, defaults to testnet)
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
```

### Service Account Setup

1. Go to Firebase Console > Project Settings > Service Accounts.
2. Click "Generate New Private Key" to download a JSON file.
3. Base64-encode the file contents:
   ```bash
   base64 -i path/to/service-account.json | tr -d '\n'
   ```
4. Set the result as `FIREBASE_SERVICE_ACCOUNT_B64`.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set all environment variables in the Vercel dashboard.
4. Deploy.

### Cron Job Setup (cron-job.org)

1. Create an account at [cron-job.org](https://cron-job.org).
2. Create a new cron job with:
   - **URL:** `https://<your-domain>/api/keeper`
   - **Method:** GET
   - **Headers:** `Authorization: Bearer <CRON_SECRET>`
   - **Schedule:** Every 15 minutes

---

## Smart Contract

The Soroban contract handles:

- `deposit(user, amount)` — Deposit USDC as collateral.
- `withdraw(user, amount)` — Withdraw collateral (subject to LTV limits).
- `spend(user, amount)` — Spend USDC from credit line.
- `offset_debt(user, amount)` — Reduce debt (admin-only, called by keeper).
- `get_collateral(user)` — Read collateral balance.
- `get_debt(user)` — Read active debt.

LTV (Loan-to-Value) limit: **70%**.

---

## Firestore Security Rules

```
invoices:
  read:  buyer or merchant
  create: merchant
  update: buyer (only set status = 'paid')
  delete: none

merchants:
  read/write: owner only

locks:
  read: public
  write: none (server-side REST API)
```

---

## License

MIT
