'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MessageSquare, Cpu, HeartHandshake, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Customer Sends Message',
    description:
      'A customer reaches out via web chat or phone call. Zentativ captures the conversation in real time and creates a tracked support ticket.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Handles or Routes',
    description:
      'Our AI scores complexity, detects sentiment, and either resolves it instantly using your knowledge base or escalates it based on your routing rules.',
    color: 'bg-[#FDE7F3] text-[#E91E8C]',
    border: 'border-pink-100',
  },
  {
    icon: HeartHandshake,
    number: '03',
    title: 'Human Takes Over Seamlessly',
    description:
      'If escalated, a human agent claims the ticket with full context — chat history, AI summary, and customer info — already loaded.',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <span className="text-[#E91E8C] text-sm font-semibold uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#1B2A4A] mt-3 mb-4">
            From Message to Resolution
            <br />
            <span className="text-[#E91E8C]">in Seconds</span>
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            Zentativ orchestrates AI and human agents so every customer gets the right help at the right time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-200 via-[#E91E8C]/40 to-green-200" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="relative"
            >
              <div className={`bg-white rounded-2xl border ${step.border} p-8 h-full shadow-sm hover:shadow-md transition-shadow`}>
                {/* Step number badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1B2A4A] text-white text-xs font-heading font-bold flex items-center justify-center">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon size={26} />
                </div>

                <h3 className="font-heading text-xl font-bold text-[#1B2A4A] mb-3">
                  {step.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps (desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-16 z-10 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center shadow-sm">
                  <ArrowRight size={12} className="text-neutral-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
