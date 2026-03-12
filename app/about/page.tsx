import type { Metadata } from 'next'
import { AboutContent } from './AboutContent'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Zentativ and our mission to transform customer support in Africa.',
}

export default function AboutPage() {
  return <AboutContent />
}
