'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, MessageCircle, Phone, CheckCircle2 } from 'lucide-react'

const channels = [
  {
    icon: Globe,
    name: 'Web Chat Widget',
    description: 'Embed a fully branded chat widget on any website in 2 lines of code.',
    features: ['Custom colors & avatar', 'File attachments', 'Ticket tracking', 'AI + human handoff'],
    color: 'from-blue-500 to-blue-600',
    badge: 'Web',
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp Business',
    description: 'Connect your WhatsApp Business number and reach customers where they already are.',
    features: ['Official Business API', 'Rich message types', 'Automated replies', '2B+ user reach'],
    color: 'from-green-500 to-green-600',
    badge: 'WhatsApp',
  },
  {
    icon: Phone,
    name: 'Voice Calls',
    description: 'AI answers inbound calls, handles queries, or transfers to a human agent instantly.',
    features: ['Inbound call handling', 'Outbound follow-ups', 'Live transcription', 'AI-powered'],
    color: 'from-purple-500 to-purple-600',
    badge: 'Voice',
  },
]

export function Channels() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-[#1B2A4A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E91E8C]/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#FF6BB5] text-sm font-semibold uppercase tracking-widest">
            Channels
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Meet Customers{' '}
            <span className="bg-gradient-to-r from-[#E91E8C] to-[#FF6BB5] bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            One unified platform. Three powerful channels. All conversations in one dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {channels.map((channel, idx) => (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-colors"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${channel.color} flex items-center justify-center mb-5 shadow-lg`}>
                <channel.icon size={26} className="text-white" />
              </div>

              {/* Badge */}
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${channel.color} text-white mb-4`}>
                {channel.badge}
              </span>

              <h3 className="font-heading text-xl font-bold text-white mb-2">
                {channel.name}
              </h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">
                {channel.description}
              </p>

              {/* Features list */}
              <ul className="space-y-2">
                {channel.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 size={14} className="text-[#E91E8C] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
