'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Bot,
  GitBranch,
  Phone,
  MessageCircle,
  BookOpen,
  Building2,
} from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Hybrid AI + Human',
    description:
      'Seamlessly blend AI automation with human empathy. AI handles the routine; your agents handle what matters.',
    gradient: 'from-[#E91E8C]/10 to-[#FF6BB5]/5',
    iconBg: 'bg-[#FDE7F3] text-[#E91E8C]',
  },
  {
    icon: GitBranch,
    title: 'Smart Routing',
    description:
      'Configurable complexity scoring routes tickets automatically based on sentiment, category, and business hours.',
    gradient: 'from-blue-50 to-blue-50/30',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Phone,
    title: 'AI Voice Calls',
    description:
      'AI answers inbound calls and makes outbound follow-ups. Full transcript synced to your ticket dashboard.',
    gradient: 'from-purple-50 to-purple-50/30',
    iconBg: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Native',
    description:
      'Deploy your AI agent to over 2 billion WhatsApp users. All conversations flow into a unified dashboard.',
    gradient: 'from-green-50 to-green-50/30',
    iconBg: 'bg-green-50 text-green-600',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base RAG',
    description:
      'Upload PDFs, docs, and FAQs. Your AI answers from your own content with source citations.',
    gradient: 'from-orange-50 to-orange-50/30',
    iconBg: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Building2,
    title: 'Multi-tenant SaaS',
    description:
      'Complete data isolation per company. White-label widget, custom AI personality, per-tenant analytics.',
    gradient: 'from-[#1B2A4A]/5 to-[#243460]/5',
    iconBg: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#E91E8C] text-sm font-semibold uppercase tracking-widest">
            Platform Features
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#1B2A4A] mt-3 mb-4">
            Everything You Need to{' '}
            <span className="text-[#E91E8C]">Scale Support</span>
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            One platform for all your customer communication — no more juggling tools.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-7 border border-neutral-100 hover:shadow-lg hover:shadow-neutral-200/60 transition-shadow cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                <feature.icon size={22} />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1B2A4A] mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
