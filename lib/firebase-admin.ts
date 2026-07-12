import type { App } from 'firebase-admin'
import type { Auth } from 'firebase-admin/auth'
import type { Firestore } from 'firebase-admin/firestore'

type MaybeApp = App | undefined

let app: MaybeApp

async function getAdminApp(): Promise<App> {
  if (app) return app

  const admin = await import('firebase-admin')

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    )
  }

  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"(.*)"$/, '$1')

  app = admin.initializeApp({
    credential: admin.cert({ projectId, clientEmail, privateKey }),
  })

  return app
}

export async function getAdminAuth(): Promise<Auth> {
  const { getAuth } = await import('firebase-admin/auth')
  return getAuth(await getAdminApp())
}

export async function getAdminDb(): Promise<Firestore> {
  const { getFirestore } = await import('firebase-admin/firestore')
  return getFirestore(await getAdminApp())
}
