import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProblemBar } from '@/components/landing/ProblemBar'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Channels } from '@/components/landing/Channels'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemBar />
        <HowItWorks />
        <Features />
        <Channels />
        <Pricing />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
