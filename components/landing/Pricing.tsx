'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    credits: '5,000 credits',
    description: 'Perfect for small teams getting started with AI support.',
    features: [
      'Up to 5,000 AI messages/mo',
      'Web chat widget',
      '1 human agent seat',
      'Knowledge base (10 docs)',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₦35,000',
    period: '/month',
    credits: '15,000 credits',
    description: 'For growing businesses that need multi-channel support.',
    features: [
      'Up to 15,000 AI messages/mo',
      'Web chat + Voice',
      '5 human agent seats',
      'Knowledge base (50 docs)',
      'Advanced analytics',
      'Priority support',
      'Custom AI personality',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '₦80,000',
    period: '/month',
    credits: '40,000 credits',
    description: 'Enterprise-grade for high-volume support operations.',
    features: [
      'Up to 40,000 AI messages/mo',
      'All channels incl. Voice',
      'Unlimited agent seats',
      'Unlimited knowledge base',
      'Custom analytics & reports',
      'Dedicated account manager',
      'SLA guarantee',
      'API access',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const creditCosts = [
  { operation: 'AI message reply', cost: '1 credit' },
  { operation: 'Human agent message', cost: '3 credits' },
  { operation: 'Voice call (per minute)', cost: '10 credits' },
  { operation: 'Knowledge base embedding', cost: '5 credits' },
  { operation: 'Outbound call (flat)', cost: '5 credits' },
]

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pricing" className="py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#7C3AED] text-sm font-semibold uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#1B2A4A] mt-3 mb-4">
            Simple, Credit-Based{' '}
            <span className="text-[#7C3AED]">Pricing</span>
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            Pay for what you use. Top up credits anytime. No surprise bills.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? 'bg-[#1B2A4A] text-white shadow-2xl shadow-[#1B2A4A]/30 scale-105'
                  : 'bg-white border border-neutral-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-violet-400 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Zap size={11} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-heading text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#1B2A4A]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-white/60' : 'text-neutral-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`font-heading text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#1B2A4A]'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/50' : 'text-neutral-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <div className={`text-xs mt-1 ${plan.highlight ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>
                  Includes {plan.credits}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? 'text-white/80' : 'text-neutral-600'}`}>
                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link href="/sign-up" className="block">
                <Button
                  className="w-full rounded-full"
                  variant={plan.highlight ? 'default' : 'navy'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Credit costs table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm"
        >
          <h3 className="font-heading text-xl font-bold text-[#1B2A4A] mb-6 text-center">
            Credit Cost Reference
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {creditCosts.map((item) => (
              <div key={item.operation} className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="font-heading text-2xl font-bold text-[#7C3AED] mb-1">
                  {item.cost.split(' ')[0]}
                </div>
                <div className="text-xs text-neutral-500">{item.operation}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
