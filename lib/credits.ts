// ─── Server-side credits helper ───────────────────────────────────────────────
// Calls n8n WF13 to deduct credits. Never throws — always returns a safe result.
// WF13 handles: deduct from companies.credits, log to credit_transactions,
// send low-balance email alerts.

const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL
const SECRET = process.env.N8N_SECRET

export type CreditType = 'ai_message' | 'human_message' | 'voice_minute' | 'kb_embed' | 'outbound_call_flat'

interface DeductParams {
  company_id: string
  type: CreditType
  amount: number
  reference?: string
}

export interface DeductResult {
  success: boolean
  new_balance: number
  insufficient: boolean
}

const FAILURE: DeductResult = { success: false, new_balance: 0, insufficient: false }

export async function deductCredits(params: DeductParams): Promise<DeductResult> {
  try {
    const res = await fetch(`${N8N_BASE}/webhook/credits/deduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-area50-secret': SECRET!,
      },
      body: JSON.stringify(params),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error(`[credits/deduct] WF13 ${res.status}: ${await res.text()}`)
      return FAILURE
    }
    return res.json() as Promise<DeductResult>
  } catch (err) {
    console.error('[credits/deduct] Network error:', err)
    return FAILURE
  }
}
