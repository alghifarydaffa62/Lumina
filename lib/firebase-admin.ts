import crypto from 'node:crypto'

interface ServiceAccount {
  projectId: string
  privateKeyId: string
  clientEmail: string
  privateKey: string
}

function getServiceAccount(): ServiceAccount {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  if (b64) {
    const raw = Buffer.from(b64, 'base64').toString('utf8')
    const parsed = JSON.parse(raw)
    return {
      projectId: parsed.project_id,
      privateKeyId: parsed.private_key_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !privateKeyId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars. Set FIREBASE_SERVICE_ACCOUNT_B64 (base64 of service account JSON) ' +
      'or set individual vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    )
  }

  privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')

  return { projectId, privateKeyId, clientEmail, privateKey }
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64url')
}

function signRS256(payload: string, privateKey: string): string {
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(payload)
  sign.end()
  return sign.sign(privateKey, 'base64url')
}

/** Create a Firebase Custom Token for the given uid (wallet address). */
export async function createFirebaseCustomToken(uid: string): Promise<string> {
  const sa = getServiceAccount()

  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT', kid: sa.privateKeyId }
  const payload = {
    iss: sa.clientEmail,
    sub: sa.clientEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid,
    claims: {},
  }

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header)))
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)))
  const message = `${headerB64}.${payloadB64}`
  const sig = signRS256(message, sa.privateKey)

  return `${message}.${sig}`
}

/** Get an OAuth2 access token for Firestore REST API. */
export async function getFirestoreAccessToken(): Promise<string> {
  const sa = getServiceAccount()

  const now = Math.floor(Date.now() / 1000)

  const claims = {
    iss: sa.clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://www.googleapis.com/oauth2/v4/token',
    exp: now + 3600,
    iat: now,
  }

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))
  const claimsB64 = base64UrlEncode(Buffer.from(JSON.stringify(claims)))
  const assertion = `${headerB64}.${claimsB64}.${signRS256(`${headerB64}.${claimsB64}`, sa.privateKey)}`

  const res = await fetch('https://www.googleapis.com/oauth2/v4/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(`Failed to get access token: ${data.error || 'unknown'}`)

  return data.access_token
}
