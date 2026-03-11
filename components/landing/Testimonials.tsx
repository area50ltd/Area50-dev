'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote:
      "Zentativ cut our average response time from 8 minutes to under 30 seconds. Our customers are happier and our agents finally have time to focus on complex issues.",
    name: 'Adaeze Okonkwo',
    role: 'Head of Customer Success',
    company: 'PayEdge Fintech',
    avatar: 'AO',
    avatarColor: 'from-[#E91E8C] to-[#FF6BB5]',
    rating: 5,
  },
  {
    quote:
      "We embedded the Zentativ chat widget on our listings site. The AI handles 80% of enquiries automatically — nights, weekends, public holidays. It never sleeps.",
    name: 'Chukwuemeka Obi',
    role: 'CEO',
    company: 'Pinnacle Realty Lagos',
    avatar: 'CO',
    avatarColor: 'from-blue-500 to-blue-600',
    rating: 5,
  },
  {
    quote:
      "The knowledge base RAG feature is incredible. We uploaded our product manuals and now the AI answers technical questions more accurately than some of our junior staff.",
    name: 'Fatima Bello',
    role: 'Operations Director',
    company: 'SwiftLogistics NG',
    avatar: 'FB',
    avatarColor: 'from-green-500 to-green-600',
    rating: 5,
  },
]

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#E91E8C] text-sm font-semibold uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[#1B2A4A] mt-3">
            Loved by African Businesses
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-neutral-50 rounded-2xl p-7 border border-neutral-100 flex flex-col hover:border-[#E91E8C]/20 hover:shadow-md transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-[#E91E8C] text-[#E91E8C]" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote size={22} className="text-[#E91E8C]/30 mb-3" />

              {/* Quote */}
              <p className="text-neutral-600 leading-relaxed text-sm flex-1 mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-heading font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{t.name}</p>
                  <p className="text-neutral-400 text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
