'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatProps {
  value: string
  suffix?: string
  label: string
  delay: number
}

function AnimatedStat({ value, suffix = '', label, delay }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayed, setDisplayed] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    const duration = 1500
    const steps = 40
    const increment = numericValue / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, numericValue)
      setDisplayed(
        Number.isInteger(numericValue)
          ? Math.round(current).toString()
          : current.toFixed(1)
      )
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center px-8 py-6"
    >
      <div className="font-heading text-4xl lg:text-5xl font-bold text-[#1B2A4A] mb-2">
        {displayed}
        {suffix}
      </div>
      <p className="text-neutral-500 text-sm font-medium leading-snug max-w-[200px] mx-auto">
        {label}
      </p>
    </motion.div>
  )
}

export function ProblemBar() {
  const stats = [
    { value: '73', suffix: '%', label: 'of support queries are repetitive and fully automatable', delay: 0 },
    { value: '8', suffix: 'x', label: 'more expensive to staff human agents vs. AI', delay: 0.15 },
    { value: '4', suffix: '+', label: 'minutes customers wait on average — costing you loyalty', delay: 0.3 },
  ]

  return (
    <section className="bg-white border-y border-neutral-100 py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
