import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Zentativ',
  description: 'Zentativ Privacy Policy - how we collect, use, store, and protect your data.',
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-[#1B2A4A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: March 17, 2026</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">1. Introduction</h2>
            <p>
              Zentativ operates a multi-tenant Hybrid AI + Human Customer Care SaaS platform at
              zentativ.com. This Privacy Policy explains how we collect, use, store, share, and
              protect information &mdash; including Google user data obtained through OAuth &mdash; when
              you use our services.
            </p>
            <p className="mt-3">
              By accessing or using Zentativ, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">2. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Account and Profile Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name and email address (from sign-up or Google OAuth)</li>
              <li>Company / organisation name</li>
              <li>Phone number (optional, for voice integrations)</li>
              <li>Profile avatar (optional upload)</li>
              <li>Role within your organisation (admin, agent, etc.)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">2.2 Google User Data (OAuth)</h3>
            <p>When you sign in via Google OAuth, we request the following scopes:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>openid</strong> &mdash; to verify your identity via Google OpenID Connect.
              </li>
              <li>
                <strong>email</strong> &mdash; to retrieve your Google account email for account
                creation and login identification.
              </li>
              <li>
                <strong>profile</strong> &mdash; to retrieve your display name and profile picture
                to pre-fill your Zentativ profile.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong>NOT</strong> request access to Gmail, Google Drive, Google Calendar,
              Google Contacts, or any other Google service beyond the three scopes listed above.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">2.3 Usage and Platform Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Support ticket content (messages between customers and AI / agents)</li>
              <li>Knowledge base documents uploaded by your organisation</li>
              <li>Widget configuration settings (colours, welcome messages)</li>
              <li>Credit usage and payment transaction records</li>
              <li>Agent status events and queue activity</li>
              <li>API request logs and error logs</li>
              <li>IP address, browser type, and device metadata</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">3. How We Use Your Data</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Google User Data &mdash; Specific Use</h3>
            <p>Google user data (name, email, profile picture) is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Authenticate you and create or link your Zentativ account.</li>
              <li>Pre-populate your account profile to reduce manual entry.</li>
              <li>Send transactional notifications (credit alerts, ticket escalations) to your email.</li>
            </ul>
            <p className="mt-3">
              We do <strong>NOT</strong> use Google user data to serve advertising, train AI models,
              build behavioural profiles, or sell to third parties. Our use of Google API data
              complies fully with the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">3.2 General Platform Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the Zentativ platform</li>
              <li>Process AI-powered and human-agent customer support conversations</li>
              <li>Route, escalate, and resolve support tickets</li>
              <li>Generate analytics and usage reports for your organisation</li>
              <li>Process payments and manage credit balances</li>
              <li>Send service notifications, security alerts, and billing updates</li>
              <li>Investigate fraud, enforce our Terms of Service, and comply with law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">4. Data Sharing with Third Parties</h2>
            <p>
              We do <strong>NOT</strong> sell, rent, or trade your personal data or Google user data.
              We share data only with the following service providers:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold">Third Party</th>
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold">Purpose</th>
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">Supabase</td>
                    <td className="px-4 py-2 border border-gray-200">Database and authentication hosting</td>
                    <td className="px-4 py-2 border border-gray-200">All structured user and platform data</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200">Vercel</td>
                    <td className="px-4 py-2 border border-gray-200">Application hosting and CDN</td>
                    <td className="px-4 py-2 border border-gray-200">Request logs, IP addresses</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">Supabase Storage</td>
                    <td className="px-4 py-2 border border-gray-200">File storage (documents, avatars)</td>
                    <td className="px-4 py-2 border border-gray-200">Uploaded documents and images</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200">Paystack</td>
                    <td className="px-4 py-2 border border-gray-200">Payment processing</td>
                    <td className="px-4 py-2 border border-gray-200">Email, payment amount and reference</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">Vapi</td>
                    <td className="px-4 py-2 border border-gray-200">AI voice call infrastructure</td>
                    <td className="px-4 py-2 border border-gray-200">Phone numbers, voice session data</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200">n8n (self-hosted VPS)</td>
                    <td className="px-4 py-2 border border-gray-200">AI workflow orchestration</td>
                    <td className="px-4 py-2 border border-gray-200">Ticket and message content for AI processing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200">Law enforcement / courts</td>
                    <td className="px-4 py-2 border border-gray-200">Legal obligation or valid legal process</td>
                    <td className="px-4 py-2 border border-gray-200">Minimum required by law</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              All sub-processors are contractually required to maintain data confidentiality and
              handle data only as instructed by Zentativ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">5. Data Storage and Protection</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All data is stored in <strong>Supabase (PostgreSQL)</strong> on AWS EU (eu-west-1),
                protected by TLS in transit and AES-256 encryption at rest.
              </li>
              <li>
                Google OAuth tokens are handled by Supabase Auth as encrypted session cookies;
                we do not store raw OAuth refresh tokens in our own database.
              </li>
              <li>
                Production data access is restricted to authorised Zentativ engineers via
                role-based access controls and enforced MFA.
              </li>
              <li>
                API keys and secrets are stored in environment variables, never in source code
                or client-side bundles.
              </li>
              <li>
                We conduct periodic security reviews and promptly address discovered vulnerabilities.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">6. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account data</strong> &mdash; retained for your active subscription, deleted
                within 30 days of account closure.
              </li>
              <li>
                <strong>Support ticket and message data</strong> &mdash; retained for 24 months for
                audit and analytics. Admins may request earlier deletion.
              </li>
              <li>
                <strong>Google user data</strong> (name, email, profile picture) &mdash; deleted when
                your account is deleted. No Google user data is retained beyond account closure.
              </li>
              <li>
                <strong>Payment records</strong> &mdash; retained for 7 years to comply with financial
                regulations.
              </li>
              <li>
                <strong>Server/access logs</strong> &mdash; retained for 90 days then automatically purged.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">Requesting Deletion</h3>
            <p>
              To request deletion of your personal data or Google user data, email{' '}
              <a href="mailto:privacy@zentativ.com" className="text-violet-600 underline">
                privacy@zentativ.com
              </a>{' '}
              with subject line <strong>Data Deletion Request</strong>. We will confirm within
              5 business days and complete deletion within 30 days, providing written confirmation
              upon completion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">7. Cookies and Tracking</h2>
            <p>We use strictly necessary cookies only:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Session cookies</strong> &mdash; managed by Supabase Auth to maintain your
                authenticated session. These expire when you sign out or after 7 days of inactivity.
              </li>
            </ul>
            <p className="mt-3">
              We do not use advertising cookies, cross-site tracking, or analytics fingerprinting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Access</strong> &mdash; request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification</strong> &mdash; correct inaccurate personal data.</li>
              <li><strong>Erasure</strong> &mdash; request deletion of your personal data.</li>
              <li><strong>Portability</strong> &mdash; receive your data in a machine-readable format.</li>
              <li>
                <strong>Withdraw consent</strong> &mdash; disconnect Google OAuth at any time via your
                Google Account settings at{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 underline"
                >
                  myaccount.google.com/permissions
                </a>.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any right, contact{' '}
              <a href="mailto:privacy@zentativ.com" className="text-violet-600 underline">
                privacy@zentativ.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">9. Children Privacy</h2>
            <p>
              Zentativ is a B2B platform for organisations and their employees. We do not knowingly
              collect personal data from individuals under 18. Contact us at{' '}
              <a href="mailto:privacy@zentativ.com" className="text-violet-600 underline">
                privacy@zentativ.com
              </a>{' '}
              if you believe a minor has provided data and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">10. International Data Transfers</h2>
            <p>
              Our infrastructure is hosted primarily in the EU. Where data is processed outside
              your jurisdiction, appropriate safeguards are in place, including Standard Contractual
              Clauses with EU/EEA sub-processors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">11. Changes to This Policy</h2>
            <p>
              We will notify you of material changes via email or an in-app banner at least 14 days
              before they take effect. The &quot;Last updated&quot; date at the top reflects the most recent
              revision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1B2A4A] mb-3">12. Contact Us</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Zentativ</strong></p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@zentativ.com" className="text-violet-600 underline">
                  privacy@zentativ.com
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
            <a href="/privacy" className="text-violet-600 font-medium">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
