'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, Phone, CheckCircle2 } from 'lucide-react'

const channels = [
  {
    icon: Globe,
    name: 'Web Chat Widget',
    description: 'Embed a fully branded chat widget on any website in 2 lines of code. AI handles queries instantly, 24/7.',
    features: ['Custom colors & avatar', 'File attachments', 'Ticket tracking', 'AI + human handoff'],
    color: 'from-blue-500 to-blue-600',
    badge: 'Web',
  },
  {
    icon: Phone,
    name: 'Voice Calls',
    description: 'AI answers inbound calls, handles queries, and transfers to a human agent instantly when needed.',
    features: ['Inbound call handling', 'Outbound follow-ups', 'Live transcription', 'AI-powered IVR'],
    color: 'from-violet-500 to-violet-600',
    badge: 'Voice',
  },
]

export function Channels() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">
            Channels
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
            Meet Customers{' '}
            <span className="bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            One unified platform. Two powerful channels. All conversations in one dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {channels.map((channel, idx) => (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-colors"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${channel.color} flex items-center justify-center mb-5 shadow-lg`}>
                <channel.icon size={26} className="text-white" />
              </div>

              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${channel.color} text-white mb-4`}>
                {channel.badge}
              </span>

              <h3 className="font-heading text-xl font-bold text-white mb-2">
                {channel.name}
              </h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">
                {channel.description}
              </p>

              <ul className="space-y-2">
                {channel.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 size={14} className="text-violet-400 flex-shrink-0" />
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
