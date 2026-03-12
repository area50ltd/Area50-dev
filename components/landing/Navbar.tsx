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
          ? 'bg-[#0A0010]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
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
            className="h-28 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Docs'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-violet-400 ${
                scrolled ? 'text-white/70' : 'text-white/80'
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
              className="text-white/70 hover:text-white hover:bg-white/10 px-5 h-10"
            >
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40 px-6 h-10">
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
              <Button variant="secondary" className="w-full h-10">Log in</Button>
            </Link>
            <Link href="/sign-up" className="flex-1">
              <Button className="w-full rounded-full h-10 bg-violet-600 hover:bg-violet-700 text-white">Get Started</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
