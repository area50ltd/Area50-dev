'use client'

import { useEffect } from 'react'
import { WidgetLauncher } from '@/components/widget/WidgetLauncher'
import { WidgetContainer } from '@/components/widget/WidgetContainer'
import { useWidget } from '@/hooks/useWidget'
import type { Company } from '@/lib/types'

// Iframe dimensions — keep in sync with embed.js defaults
const CLOSED_W = 90
const CLOSED_H = 90
const OPEN_W = 420
const OPEN_H = 680

function postResize(width: number, height: number) {
  try {
    window.parent.postMessage({ type: 'zentativ:resize', width, height }, '*')
  } catch {
    // Silently ignore if not in an iframe context
  }
}

export function WidgetClientWrapper({ company }: { company: Company }) {
  const { isOpen, open, close } = useWidget()

  // Tell the parent page (embed.js) to resize the iframe whenever open state changes
  useEffect(() => {
    postResize(isOpen ? OPEN_W : CLOSED_W, isOpen ? OPEN_H : CLOSED_H)
  }, [isOpen])

  // On first mount, set the initial (closed) size
  useEffect(() => {
    postResize(CLOSED_W, CLOSED_H)
  }, [])

  return (
    <>
      <WidgetContainer company={company} />
      <WidgetLauncher
        isOpen={isOpen}
        color={company.widget_color ?? '#1B2A4A'}
        avatarUrl={company.widget_avatar}
        onToggle={isOpen ? close : open}
      />
    </>
  )
}
