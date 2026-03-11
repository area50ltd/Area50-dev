'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-[#0A0010] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-3xl mx-auto px-6 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-4 block">
            Get Started
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to transform your customer support?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Set up in under 5 minutes. No credit card required. Cancel anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-heading font-semibold text-sm transition-colors shadow-lg shadow-violet-600/25"
            >
              Start Free Trial
              <ArrowRight size={16} />
            </Link>
            <Link
              href="mailto:hello@zentativ.com"
              className="inline-flex items-center justify-center h-13 px-8 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold text-sm transition-colors"
            >
              Talk to Sales
            </Link>
          </div>

          <p className="text-white/30 text-sm mt-8">
            Trusted by 120+ African businesses
          </p>
        </motion.div>
      </div>
    </section>
  )
}
