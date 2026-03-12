import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Terms of Service',
  description: 'Zentativ Terms of Service',
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
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'description', label: 'Description of Service' },
  { id: 'registration', label: 'Account Registration' },
  { id: 'subscription', label: 'Subscription and Payment' },
  { id: 'credits', label: 'Credit System' },
  { id: 'acceptable-use', label: 'Acceptable Use Policy' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'termination', label: 'Termination' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'contact', label: 'Contact' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#0A0010] pt-28 pb-14 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-400 text-sm font-medium mb-3">Legal</p>
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-4">
            Terms of Service
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

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
              (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and Area50/Webtonics (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
              the operator of the Zentativ platform (&ldquo;Service&rdquo;).
            </p>
            <p>
              By registering for an account, accessing the platform, using the embeddable chat widget,
              or otherwise using any part of the Service, you agree to be bound by these Terms. If you
              are using Zentativ on behalf of an organisation, you represent that you have authority to
              bind that organisation to these Terms.
            </p>
            <p>
              If you do not agree with any part of these Terms, you must not access or use the Service.
            </p>
          </Section>

          <Section id="description" title="2. Description of Service">
            <p>
              Zentativ is a multi-tenant Hybrid AI + Human Customer Care SaaS platform that enables
              businesses to deploy AI-powered customer support with intelligent escalation to human agents.
              The Service includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>An embeddable web chat widget for customer-facing support</li>
              <li>WhatsApp Business integration for conversational support via messaging</li>
              <li>Voice call support via Vapi-powered AI phone assistants</li>
              <li>A Knowledge Base system with AI-powered retrieval augmented generation (RAG)</li>
              <li>An admin dashboard for managing tickets, agents, analytics, and settings</li>
              <li>An agent console for human agents to claim and resolve escalated tickets</li>
              <li>A Super Admin panel for platform-level management</li>
              <li>Associated APIs, webhooks, and integrations</li>
            </ul>
            <p>
              The platform uses n8n-powered workflows running on a private server to orchestrate AI
              responses, ticket routing, escalation, and credit deductions. We reserve the right to
              modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </Section>

          <Section id="registration" title="3. Account Registration">
            <p>
              To use Zentativ, you must register for an account by providing accurate and complete
              information. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately at <a href="mailto:hello@zentativ.com" className="text-violet-600 hover:underline">hello@zentativ.com</a> if you suspect unauthorised access</li>
              <li>Ensuring all users added to your company account comply with these Terms</li>
            </ul>
            <p>
              Each company (tenant) on the platform operates in a fully isolated environment. Company
              administrators may create user accounts with roles including <code className="bg-neutral-100 px-1 rounded text-violet-700 text-xs">admin</code>,{' '}
              <code className="bg-neutral-100 px-1 rounded text-violet-700 text-xs">agent</code>, and{' '}
              <code className="bg-neutral-100 px-1 rounded text-violet-700 text-xs">maintenance</code>.
              You must not impersonate another user or company.
            </p>
            <p>
              We reserve the right to refuse registration or terminate accounts at our discretion,
              particularly where false information has been provided or our policies have been violated.
            </p>
          </Section>

          <Section id="subscription" title="4. Subscription and Payment">
            <p>
              Zentativ is offered on a monthly subscription basis. Current plans are:
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left p-3 border border-neutral-200 font-semibold text-neutral-700">Plan</th>
                    <th className="text-left p-3 border border-neutral-200 font-semibold text-neutral-700">Monthly Price</th>
                    <th className="text-left p-3 border border-neutral-200 font-semibold text-neutral-700">Included Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Starter', price: '₦15,000', credits: '5,000' },
                    { plan: 'Growth', price: '₦35,000', credits: '15,000' },
                    { plan: 'Business', price: '₦80,000', credits: '40,000' },
                  ].map((row) => (
                    <tr key={row.plan} className="hover:bg-neutral-50/50">
                      <td className="p-3 border border-neutral-200 font-medium text-neutral-800">{row.plan}</td>
                      <td className="p-3 border border-neutral-200">{row.price}</td>
                      <td className="p-3 border border-neutral-200">{row.credits} credits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              All payments are processed in Nigerian Naira (NGN) via Paystack, our authorised payment
              processor. By providing payment details, you authorise Paystack to charge the applicable
              subscription fee on a monthly recurring basis.
            </p>
            <p>
              Subscriptions automatically renew at the end of each billing cycle unless cancelled. You
              may cancel your subscription at any time from the Billing section of your dashboard.
              Cancellation takes effect at the end of the current billing period — no partial refunds
              are issued for unused time.
            </p>
            <p>
              Additional credit packs may be purchased at any time without affecting your subscription
              cycle. Plan upgrades take effect immediately with prorated credit adjustments.
            </p>
          </Section>

          <Section id="credits" title="5. Credit System">
            <p>
              Zentativ operates on a credit-based consumption model. Credits are deducted for each
              chargeable operation on the platform. Current credit costs are:
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left p-3 border border-neutral-200 font-semibold text-neutral-700">Operation</th>
                    <th className="text-left p-3 border border-neutral-200 font-semibold text-neutral-700">Credit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { op: 'AI message response', cost: '1 credit' },
                    { op: 'Human agent message', cost: '3 credits' },
                    { op: 'Voice call (per minute)', cost: '10 credits' },
                    { op: 'Outbound call (flat rate)', cost: '5 credits' },
                    { op: 'Knowledge base document embedding', cost: '5 credits' },
                  ].map((row) => (
                    <tr key={row.op} className="hover:bg-neutral-50/50">
                      <td className="p-3 border border-neutral-200">{row.op}</td>
                      <td className="p-3 border border-neutral-200 font-medium text-violet-700">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Credit deductions are processed server-side through our workflow engine (n8n) and are
              recorded in real time. When your credit balance falls below 500, a low-balance warning
              will be displayed in your dashboard. When your balance reaches 0, AI-powered features
              will be suspended until credits are replenished.
            </p>
            <p>
              Credits are non-transferable, non-refundable, and expire if your account is terminated.
              Monthly subscription credits do not carry over to the following billing cycle; unused
              credits from a billing period are forfeited upon renewal.
            </p>
          </Section>

          <Section id="acceptable-use" title="6. Acceptable Use Policy">
            <p>
              You agree to use Zentativ only for lawful purposes and in accordance with these Terms.
              You must not use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Violate any applicable Nigerian or international law or regulation</li>
              <li>Transmit unsolicited commercial communications (spam) to customers</li>
              <li>Collect sensitive personal data (payment card numbers, national IDs) through the chat widget</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the platform</li>
              <li>Introduce malware, viruses, or malicious code into the Service</li>
              <li>Abuse, harass, or threaten other users, agents, or members of our team</li>
              <li>Use the platform to facilitate illegal activities or harmful conduct</li>
              <li>Misrepresent your identity or the nature of your business to customers</li>
              <li>Resell access to the Service without our written authorisation</li>
              <li>Engage in scraping, crawling, or automated bulk queries beyond normal usage</li>
            </ul>
            <p>
              We reserve the right to investigate and suspend or terminate accounts that violate this
              policy, without prior notice and without liability.
            </p>
          </Section>

          <Section id="intellectual-property" title="7. Intellectual Property">
            <p>
              The Zentativ platform, including its software, design, trademarks, logos, visual assets,
              and all proprietary technology, is owned by Area50/Webtonics and protected by applicable
              intellectual property laws. These Terms do not transfer any ownership rights to you.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable, revocable licence to access
              and use the Service for your internal business purposes during the term of your active
              subscription.
            </p>
            <p>
              You retain full ownership of all content your business uploads or generates through
              the Service (knowledge base documents, customer data, ticket transcripts). You grant us
              a limited licence to process this content solely to provide the Service to you.
            </p>
            <p>
              Feedback, suggestions, or ideas you submit regarding the Service may be used by us
              without restriction or compensation.
            </p>
          </Section>

          <Section id="privacy" title="8. Privacy">
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-violet-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using Zentativ, you
              consent to the collection and use of your information as described in the Privacy Policy.
            </p>
            <p>
              As a business using Zentativ to serve your own customers, you are responsible for
              obtaining any necessary consents from your customers to process their data through
              our platform, and for maintaining your own privacy policy that discloses this processing.
            </p>
          </Section>

          <Section id="liability" title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Zentativ and its officers, directors,
              employees, and agents shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages, including but not limited to loss of profits, data, goodwill, or
              business opportunities, arising from:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Your use of or inability to access the Service</li>
              <li>Errors or inaccuracies in AI-generated responses</li>
              <li>Unauthorised access to your account or data</li>
              <li>Actions of third-party service providers (Paystack, Supabase, Vapi, etc.)</li>
              <li>Service interruptions, outages, or downtime</li>
            </ul>
            <p>
              Our total aggregate liability to you under these Terms shall not exceed the total fees
              paid by you to Zentativ in the three (3) months immediately preceding the claim.
            </p>
            <p>
              The AI responses generated by Zentativ are provided for informational and support
              automation purposes only. You are responsible for reviewing AI outputs and ensuring
              your agents provide accurate information to customers. We do not guarantee the accuracy,
              completeness, or suitability of AI-generated content for any specific purpose.
            </p>
          </Section>

          <Section id="termination" title="10. Termination">
            <p>
              Either party may terminate the agreement at any time:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>By you:</strong> Cancel your subscription from the Billing section of the dashboard.
                Access continues until the end of the current billing period.
              </li>
              <li>
                <strong>By us:</strong> We may suspend or terminate your account immediately if you
                breach these Terms, fail to pay subscription fees, or engage in conduct harmful to
                other users or the platform.
              </li>
            </ul>
            <p>
              Upon termination, your access to the Service will be disabled. We will retain your
              data for 90 days post-termination to allow for account reinstatement. After this period,
              all your data (except legally required transaction records) will be permanently deleted.
            </p>
            <p>
              Sections covering intellectual property, limitation of liability, and governing law
              survive termination of these Terms.
            </p>
          </Section>

          <Section id="governing-law" title="11. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              Federal Republic of Nigeria, without regard to its conflict of law provisions.
            </p>
            <p>
              Any dispute arising from or relating to these Terms or the use of the Service shall
              first be attempted to be resolved through good-faith negotiation between the parties.
              If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the
              courts of Nigeria.
            </p>
            <p>
              If you are accessing the Service from outside Nigeria, you are responsible for
              compliance with local laws. Nothing in these Terms limits our right to seek
              injunctive or other equitable relief in any jurisdiction.
            </p>
          </Section>

          <Section id="contact" title="12. Contact">
            <p>
              If you have any questions about these Terms of Service, please contact us:
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
                For legal correspondence, please mark your email subject with &ldquo;Legal — Terms Inquiry&rdquo;.
                We respond within 5 business days.
              </p>
            </div>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  )
}
