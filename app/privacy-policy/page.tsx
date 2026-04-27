import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Silveri collects, uses, and protects your personal information when you shop with us.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '26 April 2026';
const CONTACT_EMAIL = 'support@silverishop.in';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-silver-50 min-h-screen py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-silver-500 hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Silveri
        </Link>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-medium text-silver-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-silver-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <article className="bg-white rounded-2xl border border-silver-200 p-6 md:p-10 space-y-8 text-silver-700 text-sm leading-relaxed">
          <section>
            <p>
              Silveri (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates
              <span className="font-medium text-silver-900"> silverishop.in</span> and
              is committed to protecting the privacy of every customer who visits our
              store. This policy explains what information we collect, how we use it,
              and the choices you have. By using the site you agree to the practices
              described here.
            </p>
          </section>

          <Section title="1. Information we collect">
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-silver-900">Account details</strong> — name,
                email address, phone number, profile photo (when you sign in with
                Google), and a password (when you register with email).
              </li>
              <li>
                <strong className="text-silver-900">Order details</strong> — billing
                and shipping addresses, products purchased, order value, and order
                history.
              </li>
              <li>
                <strong className="text-silver-900">Payment details</strong> — payments
                are processed by Razorpay. We never see or store your full card or
                UPI credentials; we only retain the payment reference, status, and the
                last four digits where shared with us.
              </li>
              <li>
                <strong className="text-silver-900">Usage data</strong> — pages
                visited, products viewed, items added to cart or wishlist, and
                approximate device information collected through privacy-respecting
                analytics.
              </li>
              <li>
                <strong className="text-silver-900">Communications</strong> — messages
                you send to us via email, support forms, or WhatsApp.
              </li>
            </ul>
          </Section>

          <Section title="2. How we use your information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your account.</li>
              <li>To process orders, payments, shipping, and returns.</li>
              <li>To send order confirmations, shipping updates, and service notices.</li>
              <li>
                To answer questions, resolve disputes, and provide customer support.
              </li>
              <li>
                To improve the store, detect fraud, and keep the platform secure.
              </li>
              <li>
                To send marketing messages about new arrivals, sales, or offers — you
                can opt out at any time using the unsubscribe link in any email.
              </li>
              <li>To comply with applicable laws and respond to lawful requests.</li>
            </ul>
          </Section>

          <Section title="3. How we share your information">
            <p>
              We do not sell your personal data. We share it only with the trusted
              service providers needed to run the store:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-silver-900">Google / Firebase</strong> — for
                authentication, secure hosting of your account record, and product
                data storage.
              </li>
              <li>
                <strong className="text-silver-900">Razorpay</strong> — to process
                payments. Their own privacy policy applies to the payment session.
              </li>
              <li>
                <strong className="text-silver-900">Shipping partners</strong> — to
                deliver your order. We share only the address and contact details
                needed for delivery.
              </li>
              <li>
                <strong className="text-silver-900">Vercel</strong> — for site hosting
                and basic performance analytics.
              </li>
              <li>
                <strong className="text-silver-900">Government authorities</strong> —
                only when required by Indian law.
              </li>
            </ul>
          </Section>

          <Section title="4. Cookies and tracking">
            <p>
              We use a small number of cookies and similar technologies to keep you
              signed in, remember your cart and wishlist, and measure how the site is
              used. You can clear cookies in your browser at any time, but doing so
              will sign you out and reset your cart.
            </p>
          </Section>

          <Section title="5. Data retention">
            <p>
              Account and order records are retained as long as your account is
              active and for a reasonable period after closure to satisfy tax,
              accounting, and dispute-resolution obligations under Indian law. You
              can ask us to delete your data at any time (see &ldquo;Your
              rights&rdquo; below).
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              Personal data is transmitted over HTTPS and stored in encrypted
              databases hosted by Google Firebase. Payment data is handled inside
              Razorpay&rsquo;s PCI-DSS compliant environment. Access to internal
              systems is restricted to staff who need it to do their jobs.
            </p>
            <p className="mt-2">
              No system is perfectly secure — please use a strong password and notify
              us immediately if you suspect your account has been compromised.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>
              Subject to applicable law (including India&rsquo;s Digital Personal
              Data Protection Act, 2023), you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct or update inaccurate information.</li>
              <li>Delete your account and the data linked to it.</li>
              <li>Withdraw consent for marketing messages.</li>
              <li>Object to processing in specific circumstances.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, write to us at{' '}
              <a className="text-gold-dark hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              . We will respond within thirty (30) days.
            </p>
          </Section>

          <Section title="8. Children's privacy">
            <p>
              Silveri is intended for adult customers. We do not knowingly collect
              personal data from anyone under the age of 18. If you believe a minor
              has shared information with us, contact us and we will delete it.
            </p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>
              We may update this policy from time to time. The &ldquo;Last
              updated&rdquo; date at the top of this page reflects the most recent
              revision. Significant changes will be notified to registered users by
              email.
            </p>
          </Section>

          <Section title="10. Contact us">
            <p>
              Questions, complaints, or requests can be sent to{' '}
              <a className="text-gold-dark hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-heading)] text-lg md:text-xl font-semibold text-silver-900 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
