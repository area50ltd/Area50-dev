import Link from 'next/link'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: 'mailto:hello@zentativ.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socials = [
  { icon: Twitter, href: 'https://twitter.com/zentativ', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/zentativ', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/zentativ', label: 'Instagram' },
]

export function Footer() {
  return (
    <footer className="bg-[#0A0010] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">Z</span>
              </div>
              <span className="font-heading font-bold text-xl">Zentativ</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Hybrid AI + Human customer care for modern businesses.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-violet-600 transition-colors"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-heading font-semibold text-sm mb-4 text-white">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/40 text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Zentativ by Digitalwebtonics. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            zentativ.com
          </p>
        </div>
      </div>
    </footer>
  )
}
