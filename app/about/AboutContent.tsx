'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  Eye,
  Heart,
  Users,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  Phone,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const pillars = [
  {
    icon: Target,
    title: 'Our Mission',
    body: 'To give every African business — no matter the size — access to world-class customer support technology that was previously only available to global enterprises.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    body: 'A future where no customer is left waiting, no agent is overwhelmed, and every interaction — whether handled by AI or a human — feels personal and effective.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    body: 'Empathy first. We build technology that amplifies human connection, never replaces it. Speed and reliability matter, but so does the human on the other side of the chat.',
  },
]

const stats = [
  { value: '73%', label: 'Of queries resolved by AI instantly', icon: Zap },
  { value: '<2 min', label: 'Average first response time', icon: Clock },
  { value: '3', label: 'Support channels: web, WhatsApp & voice', icon: Phone },
  { value: '99.9%', label: 'Platform uptime SLA', icon: CheckCircle },
]

const teamValues = [
  {
    icon: Users,
    title: 'Customer First',
    body: "Every feature we ship starts with one question: does this make the end customer's experience better? If not, we don't build it.",
  },
  {
    icon: Zap,
    title: 'AI-Powered',
    body: 'We harness cutting-edge large language models and retrieval-augmented generation to handle support queries with accuracy and speed.',
  },
  {
    icon: Heart,
    title: 'Human-Centered',
    body: 'AI handles the routine. Humans handle the complex. Together they create support experiences that neither could achieve alone.',
  },
  {
    icon: Globe,
    title: 'Africa-Built',
    body: 'We are from this continent. We understand the infrastructure, the languages, and the business needs. This platform is built specifically for African realities.',
  },
]

export function AboutContent() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0010] pt-32 pb-24 px-4 md:px-6">
        {/* Violet gradient accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-700/20 blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium tracking-wide mb-6"
          >
            <Shield size={12} />
            <span>Our Story &amp; Mission</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-bold text-4xl md:text-6xl text-white leading-tight mb-6"
          >
            Built to Transform{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-200">
              Customer Support
            </span>{' '}
            in Africa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Zentativ is the hybrid AI + human customer care platform built for the pace of modern African business.
            We combine the speed of AI with the empathy of real humans — so your customers always feel heard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/sign-up">
              <Button className="rounded-full px-8 h-12 text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40">
                Get Started Free
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="mailto:hello@zentativ.com">
              <Button
                variant="outline"
                className="rounded-full px-8 h-12 text-base font-medium border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent"
              >
                Talk to Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ── */}
      <section className="bg-white py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-violet-600 font-semibold text-sm tracking-wide uppercase mb-3"
            >
              Why we exist
            </motion.p>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="font-heading font-bold text-3xl md:text-4xl text-neutral-900"
            >
              Guided by purpose, driven by impact
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-8 rounded-2xl border border-neutral-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                  <pillar.icon size={22} className="text-violet-600" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-neutral-900 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="bg-neutral-50 py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p
                custom={0}
                variants={fadeUp}
                className="text-violet-600 font-semibold text-sm tracking-wide uppercase mb-3"
              >
                Our Story
              </motion.p>
              <motion.h2
                custom={1}
                variants={fadeUp}
                className="font-heading font-bold text-3xl md:text-4xl text-neutral-900 mb-6"
              >
                From frustration to breakthrough
              </motion.h2>
              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-neutral-500 leading-relaxed text-base mb-4"
              >
                Zentativ started when our team at Area50/Webtonics noticed that African businesses were
                losing customers due to slow, expensive, and inconsistent support. Customer service teams
                were burned out. Response times were measured in hours, not minutes. And the technology
                solutions that existed were built for Western markets with Western pricing.
              </motion.p>
              <motion.p
                custom={3}
                variants={fadeUp}
                className="text-neutral-500 leading-relaxed text-base mb-4"
              >
                We built Zentativ to change that. A platform that combines the speed of AI with the empathy
                of human agents — so businesses can scale their support without scaling their costs.
              </motion.p>
              <motion.p
                custom={4}
                variants={fadeUp}
                className="text-neutral-500 leading-relaxed text-base"
              >
                Today, Zentativ handles web chat, WhatsApp, and voice calls — all orchestrated by intelligent
                workflows that know when to let AI handle things and when to pass the baton to a human.
                Because some conversations just need a human touch.
              </motion.p>
            </motion.div>

            {/* Story card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 translate-x-3 translate-y-3" />
              <div className="relative rounded-3xl bg-[#0A0010] p-10 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-6">
                  <TrendingUp size={20} className="text-violet-400" />
                </div>
                <blockquote className="text-white/80 text-lg leading-relaxed italic mb-6">
                  &ldquo;We knew the problem intimately. We had seen small businesses lose loyal customers
                  because they simply couldn&apos;t respond fast enough. That was the moment we decided
                  to build the solution ourselves.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">A</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Area50 / Webtonics</p>
                    <p className="text-white/40 text-xs">Founders, Zentativ</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0A0010] py-20 px-4 md:px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-900/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="font-heading font-bold text-3xl md:text-4xl text-white mb-4"
            >
              Numbers that speak for themselves
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="text-white/40 text-base max-w-xl mx-auto"
            >
              Real outcomes for real businesses across Africa.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-600/30 transition-colors">
                  <stat.icon size={18} className="text-violet-400" />
                </div>
                <div className="font-heading font-bold text-3xl md:text-4xl text-white mb-2">
                  {stat.value}
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Values ── */}
      <section className="bg-white py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-violet-600 font-semibold text-sm tracking-wide uppercase mb-3"
            >
              How we work
            </motion.p>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="font-heading font-bold text-3xl md:text-4xl text-neutral-900"
            >
              The principles that drive us
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-7 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-violet-200 hover:shadow-md hover:shadow-violet-50 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4 group-hover:bg-violet-600 transition-colors duration-300">
                  <value.icon
                    size={20}
                    className="text-violet-600 group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <h3 className="font-heading font-semibold text-base text-neutral-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{value.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden py-24 px-4 md:px-6 bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
        >
          {/* Gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-violet-600 to-violet-800" />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-violet-900/40 blur-3xl" />

          <div className="relative px-10 py-16 text-center">
            <p className="text-violet-200 font-medium text-sm uppercase tracking-wide mb-4">
              Start today — no credit card required
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6 leading-tight">
              Ready to transform your support?
            </h2>
            <p className="text-violet-100/70 text-base md:text-lg max-w-xl mx-auto mb-10">
              Join businesses across Africa using Zentativ to deliver faster, smarter,
              and more human support — at a fraction of the cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up">
                <Button className="rounded-full px-8 h-12 text-base font-semibold bg-white text-violet-700 hover:bg-violet-50 shadow-lg">
                  Start Free Trial
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="mailto:hello@zentativ.com">
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-medium border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
