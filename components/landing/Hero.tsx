'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageSquare, Zap, Users } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay },
  }),
}

function WidgetMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[#E91E8C]/20 blur-3xl rounded-3xl" />

      {/* Widget card */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Widget header */}
        <div className="bg-[#1B2A4A] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Support Assistant</p>
              <p className="text-green-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Messages */}
        <div className="bg-neutral-50 p-4 space-y-3 h-56">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap size={10} className="text-[#E91E8C]" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-neutral-700 shadow-sm max-w-[80%]">
              Hi! How can I help you today? I can answer questions, process requests, or connect you with our team. 👋
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
            className="flex justify-end"
          >
            <div className="bg-[#1B2A4A] rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white max-w-[80%]">
              I need help with my order status
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
            className="flex gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap size={10} className="text-[#E91E8C]" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-neutral-700 shadow-sm max-w-[80%]">
              Sure! Your order #A4521 is currently in transit and expected by Thursday. 📦
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="flex items-center gap-1 text-[10px] text-neutral-400"
          >
            <Users size={10} />
            <span>Human agent available if needed</span>
          </motion.div>
        </div>

        {/* Input area */}
        <div className="border-t border-neutral-100 p-3 flex gap-2 bg-white">
          <div className="flex-1 bg-neutral-50 rounded-full px-3 py-1.5 text-xs text-neutral-400 border border-neutral-200">
            Type your message...
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E91E8C] flex items-center justify-center">
            <ArrowRight size={12} className="text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#1B2A4A] noise-overlay flex items-center overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E91E8C]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#243460]/60 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-600/20 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-violet-400 text-sm font-medium">Now with AI voice call support</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
          >
            AI That Handles{' '}
            <span className="bg-gradient-to-r from-[#E91E8C] to-[#FF6BB5] bg-clip-text text-transparent">
              Support.
            </span>
            <br />
            Humans That{' '}
            <span className="text-white/80">Close Deals.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.35}
            className="text-white/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg"
          >
            Zentativ handles 73% of support queries automatically, routes complex issues
            to human agents, and works across web chat and phone — all in one platform.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/sign-up">
              <Button size="xl" className="w-full sm:w-auto font-heading shadow-xl shadow-[#E91E8C]/30">
                Start Free Trial
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="xl"
                variant="outline"
                className="w-full sm:w-auto font-heading"
              >
                Book a Demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.65}
            className="mt-6 text-white/40 text-sm"
          >
            No credit card required · 14-day free trial · Setup in 5 minutes
          </motion.p>
        </div>

        {/* Right — widget mockup */}
        <div className="lg:flex justify-center hidden">
          <WidgetMockup />
        </div>
      </div>
    </section>
  )
}
