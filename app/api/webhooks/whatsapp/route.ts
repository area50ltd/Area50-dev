import { NextResponse } from 'next/server'

// ============================================================
// WhatsApp automation is not yet implemented.
// These handlers are commented out until WF11/WF12 (WhatsApp
// workflows) are ready in n8n.
// ============================================================

// WhatsApp Cloud API verification challenge
export async function GET(/* req: Request */) {
  // const { searchParams } = new URL(req.url)
  // const mode = searchParams.get('hub.mode')
  // const token = searchParams.get('hub.verify_token')
  // const challenge = searchParams.get('hub.challenge')
  //
  // if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
  //   return new Response(challenge, { status: 200 })
  // }
  //
  // return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ error: 'WhatsApp integration coming soon' }, { status: 501 })
}

// Incoming WhatsApp message
export async function POST(/* req: Request */) {
  // try {
  //   const body = await req.json()
  //
  //   const entry = body?.entry?.[0]
  //   const changes = entry?.changes?.[0]
  //   const message = changes?.value?.messages?.[0]
  //
  //   if (!message) {
  //     return NextResponse.json({ status: 'no_message' })
  //   }
  //
  //   const from = message.from as string
  //   const text = message.text?.body as string | undefined
  //   const waPhoneNumberId = changes?.value?.metadata?.phone_number_id as string | undefined
  //
  //   if (text && waPhoneNumberId) {
  //     // Route through n8n for AI processing
  //     await callN8n('/webhook/ai/chat', {
  //       channel: 'whatsapp',
  //       message: text,
  //       customer_phone: from,
  //       whatsapp_phone_number_id: waPhoneNumberId,
  //       session_id: `wa_${from}`,
  //       language: 'en',
  //     })
  //   }
  //
  //   return NextResponse.json({ status: 'ok' })
  // } catch (err) {
  //   console.error('[api/webhooks/whatsapp]', err)
  //   return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  // }

  return NextResponse.json({ error: 'WhatsApp integration coming soon' }, { status: 501 })
}
