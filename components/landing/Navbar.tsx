'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — single source, CSS filter for white on dark hero */}
        <Link href="/" className="flex items-center overflow-hidden" style={{ height: '40px' }}>
          <Image
            src="/images/logo/logo-dark.png"
            alt="Zentativ"
            width={360}
            height={108}
            className="h-28 w-auto transition-all duration-300"
            style={!scrolled ? { filter: 'brightness(0) invert(1)' } : {}}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Docs'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-[#E91E8C] ${
                scrolled ? 'text-neutral-600' : 'text-white/80'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={scrolled ? 'text-neutral-700 hover:text-[#1B2A4A]' : 'text-white hover:bg-white/10'}
            >
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="rounded-full font-semibold shadow-lg shadow-pink-DEFAULT/25">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 ${scrolled ? 'text-neutral-700' : 'text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 flex flex-col gap-4"
        >
          {['Features', 'Pricing', 'Docs'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-neutral-700 font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <Link href="/login" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">Log in</Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button size="sm" className="w-full rounded-full">Get Started</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
