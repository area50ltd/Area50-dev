const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL
const SECRET = process.env.N8N_SECRET

/**
 * n8n AI responses contain raw newlines/control characters inside JSON strings,
 * which is invalid JSON. This walks the raw text character-by-character and
 * escapes control chars only when they appear inside a string literal.
 */
function sanitizeN8nJSON(text: string): string {
  let inString = false
  let escaped = false
  const out: string[] = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const code = char.charCodeAt(0)

    if (escaped) {
      out.push(char)
      escaped = false
      continue
    }

    if (char === '\\' && inString) {
      out.push(char)
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      out.push(char)
      continue
    }

    // Unescaped control character inside a JSON string — must be escaped
    if (inString && code <= 0x1f) {
      switch (code) {
        case 0x09: out.push('\\t'); break   // tab
        case 0x0a: out.push('\\n'); break   // newline
        case 0x0d: out.push('\\r'); break   // carriage return
        default:   out.push(`\\u${code.toString(16).padStart(4, '0')}`)
      }
      continue
    }

    out.push(char)
  }

  return out.join('')
}

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

  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    // n8n sent raw control characters inside JSON strings — sanitize and retry
    return JSON.parse(sanitizeN8nJSON(text)) as T
  }
}
