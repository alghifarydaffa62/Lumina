import { getFirestoreAccessToken } from '@/lib/firebase-admin'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ''

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

async function headers(): Promise<HeadersInit> {
  const token = await getFirestoreAccessToken()
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function runQuery(collectionId: string, filters: { field: string; op: string; value: unknown }[]) {
  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId }],
    where: {
      compositeFilter: {
        op: 'AND',
        filters: filters.map((f) => ({
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op,
            value: toValue(f.value),
          },
        })),
      },
    },
  }

  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ structuredQuery }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Firestore query failed: ${data.error?.message || JSON.stringify(data)}`)

  return (data as Array<{ document?: { name: string; fields: Record<string, unknown> } }>)
    .filter((r) => r.document)
    .map((r) => ({
      name: r.document!.name,
      fields: r.document!.fields,
    }))
}

export async function getDocument(path: string) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: await headers(),
  })

  if (res.status === 404) return null

  const data = await res.json()
  if (!res.ok) throw new Error(`Firestore get failed: ${data.error?.message || JSON.stringify(data)}`)

  return data as { name: string; fields: Record<string, unknown>; createTime: string; updateTime: string }
}

export async function commit(writes: { update?: { name: string; fields: Record<string, unknown> } }[]) {
  const res = await fetch(`${BASE}:commit`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ writes }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Firestore commit failed: ${data.error?.message || JSON.stringify(data)}`)
  return data
}

function toValue(val: unknown): Record<string, unknown> {
  if (typeof val === 'string') return { stringValue: val }
  if (typeof val === 'number') return { integerValue: String(val) }
  if (val instanceof Date) return { timestampValue: val.toISOString() }
  if (val === null) return { nullValue: null }
  if (typeof val === 'boolean') return { booleanValue: val }
  return { stringValue: String(val) }
}

export function fieldsToObject<T = Record<string, unknown>>(fields: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(fields)) {
    result[key] = fromValue(val as Record<string, unknown>)
  }
  return result as T
}

function fromValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val.stringValue
  if ('integerValue' in val) return Number(val.integerValue)
  if ('doubleValue' in val) return val.doubleValue
  if ('booleanValue' in val) return val.booleanValue
  if ('timestampValue' in val) return val.timestampValue
  if ('nullValue' in val) return null
  return val
}
