'use client'

import { WidgetLauncher } from '@/components/widget/WidgetLauncher'
import { WidgetContainer } from '@/components/widget/WidgetContainer'
import { useWidget } from '@/hooks/useWidget'
import type { Company } from '@/lib/types'

export function WidgetClientWrapper({ company }: { company: Company }) {
  const { isOpen, open, close } = useWidget()

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
