'use client'

import { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-[#E91E8C] to-[#c91878] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1B2A4A]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-3xl mx-auto px-6 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4">
            Start your free trial today.
          </h2>
          <p className="text-white/70 text-lg mb-10">
            No credit card required. Setup in 5 minutes. Cancel anytime.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 bg-white/20 rounded-2xl px-8 py-6"
            >
              <CheckCircle2 size={24} className="text-white" />
              <p className="text-white font-semibold">
                Great! We&apos;ll be in touch at <strong>{email}</strong>
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 px-5 rounded-full bg-white/15 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm text-sm"
              />
              <button
                type="submit"
                className="h-12 px-7 rounded-full bg-white text-[#E91E8C] font-heading font-bold text-sm hover:bg-white/90 transition-colors flex items-center gap-2 justify-center shadow-lg"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="text-white/50 text-sm mt-6">
            Trusted by 120+ African businesses
          </p>
        </motion.div>
      </div>
    </section>
  )
}
