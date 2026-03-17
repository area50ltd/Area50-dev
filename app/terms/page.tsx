import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Zentativ',
  description: 'Zentativ Terms of Service - the rules and conditions for using our platform.',
}

export default function TermsPage() {
  const year = new Date().getFullYear()
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-[#1B2A4A]">Zentativ</a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Back to Home
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#1B2A4A] mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: March 17, 2026</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Zentativ (&quot;the Service&quot;), operated by Zentativ, you agree to
              be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the
              Service. These Terms apply to all users, including business administrators, agents,
              and end customers interacting through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">2. Description of Service</h2>
            <p>
              Zentativ is a multi-tenant Hybrid AI + Human Customer Care SaaS platform. It enables
              businesses to deploy AI-powered customer support via web chat, WhatsApp, and voice
              calls, with escalation to human agents. Zentativ provides the frontend interface,
              authentication, data storage, and integrations; AI workflow execution runs on
              separate infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You must provide accurate, current, and complete information when creating an account.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your login credentials
                and for all activity that occurs under your account.
              </li>
              <li>
                You must notify us immediately at{' '}
                <a href="mailto:support@zentativ.com" className="text-violet-600 underline">
                  support@zentativ.com
                </a>{' '}
                if you suspect unauthorised access to your account.
              </li>
              <li>
                Each organisation account is separately scoped. Admins are responsible for
                managing their users and agents within their organisation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">4. Subscription Plans and Credits</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Plans</h3>
            <p>
              Zentativ offers subscription plans (Starter, Growth, Business) billed monthly.
              Each plan includes a credit allocation used to power AI messages, human agent
              messages, voice minutes, and knowledge base operations.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Credits</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Credits are consumed per operation (AI message, human message, voice minute, etc.).</li>
              <li>Credits are non-refundable and non-transferable between organisations.</li>
              <li>When credits reach zero, AI features are disabled until credits are topped up.</li>
              <li>Additional credit packs can be purchased at any time.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Billing and Payments</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payments are processed via Paystack in Nigerian Naira (NGN).</li>
              <li>Subscription fees are charged at the start of each billing period.</li>
              <li>All sales are final. We do not offer refunds on subscription fees or credit packs except as required by applicable law.</li>
              <li>Failure to pay may result in suspension or termination of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">5. Acceptable Use</h2>
            <p>You agree not to use Zentativ to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Violate any applicable law or regulation.</li>
              <li>Transmit spam, unsolicited messages, or abusive content.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
              <li>Upload malware, viruses, or any code designed to interfere with the Service.</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure.</li>
              <li>Scrape, reverse-engineer, or decompile any part of the platform.</li>
              <li>Use the AI features to generate content that is illegal, harmful, or discriminatory.</li>
              <li>Exceed API rate limits or otherwise place unreasonable load on the Service.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms
              without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">6. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-violet-600 underline">Privacy Policy</a>, which is
              incorporated into these Terms by reference. By using the Service, you consent to the
              data practices described in the Privacy Policy, including the use of Google OAuth for
              authentication.
            </p>
            <p className="mt-3">
              You retain ownership of all data you upload to the platform (support transcripts,
              knowledge base documents, etc.). You grant Zentativ a limited licence to process this
              data solely to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">7. Intellectual Property</h2>
            <p>
              All software, UI designs, logos, and branding associated with Zentativ are the
              exclusive property of Zentativ. Nothing in these Terms transfers any intellectual
              property rights to you. You may not copy, modify, distribute, or create derivative
              works based on the Service without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">8. Third-Party Services</h2>
            <p>
              The Service integrates with third-party providers (Supabase, Paystack, Vapi,
              WhatsApp Business, Slack, etc.). Your use of those integrations is subject to the
              respective third-party terms of service. Zentativ is not responsible for the acts or
              omissions of third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">9. Service Availability and SLA</h2>
            <p>
              We aim for high availability but do not guarantee 100% uptime. We may perform
              scheduled maintenance with advance notice where possible. Zentativ is not liable for
              losses caused by downtime, data loss, or service interruptions unless caused by our
              gross negligence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Zentativ and its officers, employees, and
              affiliates shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising from your use of the Service, including but not limited
              to loss of profits, data, or goodwill. Our total aggregate liability to you shall not
              exceed the amount you paid to us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Zentativ, its officers, directors,
              employees, and agents from any claims, damages, losses, or expenses (including legal
              fees) arising from your use of the Service, your violation of these Terms, or your
              infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">12. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. You may close your account
              from the Settings page. We may suspend or terminate your account if you breach these
              Terms, fail to pay, or engage in activity that harms the Service or other users.
              Upon termination, your data will be deleted per our{' '}
              <a href="/privacy" className="text-violet-600 underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes
              shall be resolved in the courts of Lagos State, Nigeria, unless otherwise agreed in
              writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">14. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you via email or in-app banner
              at least 14 days before material changes take effect. Continued use of the Service
              after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">15. Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Zentativ</strong></p>
              <p>
                Email:{' '}
                <a href="mailto:support@zentativ.com" className="text-violet-600 underline">
                  support@zentativ.com
                </a>
              </p>
              <p>Website: www.zentativ.com</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-gray-400">
          <span>&copy; {year} Zentativ. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-violet-600 font-medium">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
