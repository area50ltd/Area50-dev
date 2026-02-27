const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL
const SECRET = process.env.N8N_SECRET

export async function callN8n<T = unknown>(route: string, payload: object): Promise<T> {
  const res = await fetch(`${N8N_BASE}${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-area50-secret': SECRET!,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`n8n error on ${route}: ${res.status} ${res.statusText}`)
  return res.json()
}
