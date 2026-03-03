'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(false)

  // Fire immediately on any internal link click — before any JS loads
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return

      // Same page click — skip
      const currentPath = window.location.pathname
      const targetPath = href.split('?')[0]
      if (currentPath === targetPath) return

      start()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Complete the bar when the new route finishes rendering
  useEffect(() => {
    if (activeRef.current) complete()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function start() {
    const bar = barRef.current
    if (!bar || activeRef.current) return
    activeRef.current = true
    bar.style.transition = 'none'
    bar.style.opacity = '1'
    bar.style.width = '0%'
    // Force reflow so the width reset takes effect before animating
    bar.getBoundingClientRect()
    bar.style.transition = 'width 8s cubic-bezier(0.05, 0.8, 0.1, 1)'
    bar.style.width = '85%'
  }

  function complete() {
    const bar = barRef.current
    if (!bar) return
    activeRef.current = false
    bar.style.transition = 'width 0.15s ease'
    bar.style.width = '100%'
    setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.transition = 'opacity 0.2s ease'
        barRef.current.style.opacity = '0'
        setTimeout(() => {
          if (barRef.current) barRef.current.style.width = '0%'
        }, 200)
      }
    }, 150)
  }

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: '0%',
        opacity: 0,
        backgroundColor: '#E91E8C',
        boxShadow: '0 0 8px rgba(233, 30, 140, 0.6)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
