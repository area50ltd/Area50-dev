import { Mail, Phone, Hash } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { User } from '@/lib/types'

interface CustomerInfoPanelProps {
  customer: User | null
  ticketCount?: number
}

export function CustomerInfoPanel({ customer, ticketCount = 0 }: CustomerInfoPanelProps) {
  if (!customer) {
    return (
      <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
        <h4 className="font-heading text-xs font-bold text-[#1B2A4A] mb-3">Customer Info</h4>
        <p className="text-xs text-neutral-400">No customer information available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
      <h4 className="font-heading text-xs font-bold text-[#1B2A4A] mb-4">Customer Info</h4>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#243460] flex items-center justify-center text-white text-sm font-heading font-bold flex-shrink-0">
          {getInitials(customer.name)}
        </div>
        <div>
          <p className="font-semibold text-[#1B2A4A] text-sm">{customer.name ?? 'Anonymous'}</p>
          <p className="text-neutral-400 text-xs capitalize">{customer.role}</p>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2.5">
        {customer.email && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Mail size={12} className="text-neutral-400 flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Phone size={12} className="text-neutral-400 flex-shrink-0" />
            <a href={`tel:${customer.phone}`} className="hover:text-[#E91E8C] transition-colors">{customer.phone}</a>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Hash size={12} className="flex-shrink-0" />
          <span>{ticketCount} previous ticket{ticketCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
