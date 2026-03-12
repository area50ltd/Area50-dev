import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Zentativ Privacy Policy',
}

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="font-heading font-bold text-xl text-violet-600 mb-4 pb-2 border-b border-neutral-100">
        {title}
      </h2>
      <div className="space-y-3 text-neutral-600 leading-relaxed text-[15px]">{children}</div>
    </section>
  )
}

const tocItems = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-collected', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'data-storage', label: 'Data Storage and Security' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'childrens', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#0A0010] pt-28 pb-14 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-400 text-sm font-medium mb-3">Legal</p>
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/40 text-sm">
            Last updated:{' '}
            <time dateTime="2026-03-01">March 2026</time>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">

        {/* Table of Contents */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-10 shadow-sm">
          <p className="font-heading font-semibold text-neutral-900 text-sm mb-4">Table of Contents</p>
          <ol className="space-y-1.5">
            {tocItems.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className="text-sm text-violet-600 hover:text-violet-800 transition-colors flex items-start gap-2"
                >
                  <span className="text-neutral-400 tabular-nums w-5 shrink-0">{i + 1}.</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-8 md:p-12 shadow-sm">

          <Section id="introduction" title="1. Introduction">
            <p>
              Welcome to Zentativ (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). Zentativ is a Hybrid AI + Human
              Customer Care SaaS platform operated by Area50/Webtonics. We are committed to protecting
              the personal information of our users, their customers, and anyone who interacts with
              our platform.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your
              information when you use Zentativ&apos;s services, including our web application, API,
              embeddable chat widget, and related services (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              By accessing or using the Service, you agree to the collection and use of information
              in accordance with this policy. If you do not agree, please discontinue use of our Service.
            </p>
          </Section>

          <Section id="information-collected" title="2. Information We Collect">
            <p>We collect information you provide directly and information generated through your use of the Service:</p>

            <p className="font-semibold text-neutral-800 mt-4">Account Information</p>
            <p>
              When you register, we collect your name, email address, company name, phone number,
              and the password you create. Business subscription admins also provide billing contact details.
            </p>

            <p className="font-semibold text-neutral-800 mt-4">Usage Data</p>
            <p>
              We automatically collect information about how you interact with the Service, including
              IP addresses, browser type, pages visited, features used, timestamps, and support
              ticket content (messages exchanged between customers and your agents or our AI).
            </p>

            <p className="font-semibold text-neutral-800 mt-4">Payment Information</p>
            <p>
              Billing details (card number, expiry, CVV) are collected and processed directly by our
              payment provider, Paystack. We store only non-sensitive transaction metadata such as
              payment references, amounts, and dates — never raw card data.
            </p>

            <p className="font-semibold text-neutral-800 mt-4">Customer Data</p>
            <p>
              When your customers interact through the Zentativ widget, we collect their messages,
              session identifiers, and any contact information they voluntarily share. You, as the
              platform subscriber, are the data controller for your customers&apos; data; Zentativ
              acts as data processor.
            </p>

            <p className="font-semibold text-neutral-800 mt-4">Uploaded Files</p>
            <p>
              Documents you upload to the Knowledge Base (PDFs, DOCX, CSVs, etc.) are stored securely
              and used solely for AI knowledge retrieval within your account.
            </p>
          </Section>

          <Section id="how-we-use" title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Provide, operate, and maintain the Zentativ platform and its features</li>
              <li>Process payments and manage your subscription and credit balance</li>
              <li>Authenticate users and enforce access controls across multi-tenant accounts</li>
              <li>Power AI-driven support responses via our n8n workflow engine and integrated LLMs</li>
              <li>Improve the accuracy and performance of AI models through anonymised analytics</li>
              <li>Send transactional emails (billing receipts, password resets, credit alerts)</li>
              <li>Respond to your support requests, questions, and feedback</li>
              <li>Monitor for abuse, fraud, or violations of our Terms of Service</li>
              <li>Comply with legal obligations applicable to our operations in Nigeria</li>
            </ul>
            <p>
              We do not sell your personal information or your customers&apos; personal information to
              third parties, ever.
            </p>
          </Section>

          <Section id="data-storage" title="4. Data Storage and Security">
            <p>
              Your data is stored in Supabase (cloud-hosted PostgreSQL) with servers located in the
              EU (West region). All data in transit is encrypted using TLS 1.2 or higher. Data at
              rest is encrypted by the storage provider using AES-256.
            </p>
            <p>
              Uploaded files are stored in Supabase Storage with bucket-level access controls.
              Sensitive credentials (API keys, payment keys) are stored as server-side environment
              variables and are never exposed to the client browser.
            </p>
            <p>We implement the following security controls:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Role-based access control — users can only access data belonging to their company</li>
              <li>Company-scoped database queries — every query includes a <code className="bg-neutral-100 px-1 rounded text-violet-700 text-xs">company_id</code> filter</li>
              <li>Server-side authentication verification on every protected API route</li>
              <li>Signed URLs for file downloads with short expiry windows</li>
              <li>n8n workflows running on a private VPS with secret-header authentication</li>
            </ul>
            <p>
              While we implement industry-standard safeguards, no method of transmission over the
              internet is 100% secure. We encourage you to use a strong password and protect your
              account credentials.
            </p>
          </Section>

          <Section id="third-party" title="5. Third-Party Services">
            <p>
              Zentativ integrates with third-party services to deliver its functionality.
              Each operates under its own privacy policy:
            </p>
            <ul className="space-y-3 mt-2">
              {[
                {
                  name: 'Supabase',
                  url: 'https://supabase.com/privacy',
                  desc: 'Database and file storage provider. Your data resides on Supabase-managed infrastructure.',
                },
                {
                  name: 'Paystack',
                  url: 'https://paystack.com/privacy',
                  desc: 'Payment processing. Handles card data securely and returns only transaction references to us.',
                },
                {
                  name: 'Vapi',
                  url: 'https://vapi.ai/privacy',
                  desc: 'Voice AI infrastructure for inbound and outbound call handling.',
                },
                {
                  name: 'n8n (self-hosted)',
                  url: 'https://n8n.io/privacy',
                  desc: 'Workflow automation engine running on our private VPS. Handles AI routing, escalation, and knowledge base workflows.',
                },
                {
                  name: 'Vercel',
                  url: 'https://vercel.com/legal/privacy-policy',
                  desc: 'Frontend hosting and serverless API functions.',
                },
              ].map((svc) => (
                <li key={svc.name} className="flex gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span>
                    <a
                      href={svc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-violet-600 hover:underline"
                    >
                      {svc.name}
                    </a>{' '}
                    — {svc.desc}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="retention" title="6. Data Retention">
            <p>
              We retain your account data for as long as your account remains active. If you close your
              account or your subscription lapses, we will retain your data for a further 90 days to
              allow for account reinstatement, after which it will be permanently deleted.
            </p>
            <p>
              Payment transaction records are retained for 7 years in compliance with Nigerian financial
              regulations. Anonymised aggregate analytics data may be retained indefinitely for product
              improvement purposes.
            </p>
            <p>
              Your customers&apos; conversation history (ticket messages) is retained for the duration of your
              active subscription. You may delete individual tickets or bulk-export and delete data at any time
              from the dashboard.
            </p>
          </Section>

          <Section id="your-rights" title="7. Your Rights">
            <p>Subject to applicable law, you have the following rights regarding your personal data:</p>
            <ul className="space-y-2 mt-2">
              {[
                { right: 'Access', desc: 'Request a copy of the personal data we hold about you.' },
                { right: 'Rectification', desc: 'Ask us to correct inaccurate or incomplete data.' },
                { right: 'Erasure', desc: 'Request deletion of your personal data ("right to be forgotten").' },
                { right: 'Portability', desc: 'Receive your data in a machine-readable format (CSV/JSON).' },
                { right: 'Objection', desc: 'Object to certain types of processing, including marketing.' },
                { right: 'Restriction', desc: 'Ask us to restrict processing in certain circumstances.' },
              ].map((item) => (
                <li key={item.right} className="flex gap-2">
                  <span className="font-semibold text-neutral-800 shrink-0">{item.right}:</span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:hello@zentativ.com" className="text-violet-600 hover:underline">
                hello@zentativ.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section id="cookies" title="8. Cookies">
            <p>
              Zentativ uses cookies and similar technologies to maintain user sessions, remember
              preferences, and collect anonymous usage analytics. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>Session cookies</strong> — required for authentication; deleted when you close your browser</li>
              <li><strong>Persistent cookies</strong> — remember your login state across sessions</li>
              <li><strong>Analytics cookies</strong> — anonymous product usage data to help us improve</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies will
              prevent you from logging in to the platform.
            </p>
          </Section>

          <Section id="childrens" title="9. Children's Privacy">
            <p>
              Zentativ is a business-to-business platform intended for use by companies and their
              employees. We do not knowingly collect personal information from children under the age
              of 18. If you believe a child has provided us with personal information, please contact
              us at{' '}
              <a href="mailto:hello@zentativ.com" className="text-violet-600 hover:underline">
                hello@zentativ.com
              </a>{' '}
              and we will delete it promptly.
            </p>
          </Section>

          <Section id="changes" title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we
              will update the &ldquo;Last updated&rdquo; date at the top of this page and notify active subscribers
              via email at least 14 days before the change takes effect.
            </p>
            <p>
              Continued use of the Service after a policy update constitutes acceptance of the revised
              policy. We encourage you to review this page periodically.
            </p>
          </Section>

          <Section id="contact" title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please reach out to us:
            </p>
            <div className="mt-4 p-5 rounded-xl bg-violet-50 border border-violet-100">
              <p className="font-semibold text-neutral-900 mb-1">Zentativ (Area50 / Webtonics)</p>
              <p>
                Email:{' '}
                <a href="mailto:hello@zentativ.com" className="text-violet-600 hover:underline font-medium">
                  hello@zentativ.com
                </a>
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                We aim to respond to all privacy-related inquiries within 5 business days.
              </p>
            </div>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  )
}
