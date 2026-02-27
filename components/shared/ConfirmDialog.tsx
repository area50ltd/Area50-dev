'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md mx-4">
        {variant === 'danger' && (
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
        )}

        <h3 className="font-heading text-xl font-bold text-[#1B2A4A] text-center mb-2">
          {title}
        </h3>
        <p className="text-neutral-500 text-sm text-center mb-7">{description}</p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1 rounded-full">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 rounded-full ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
