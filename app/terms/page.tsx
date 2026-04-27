import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions that govern your use of the Silveri online store.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '26 April 2026';
const CONTACT_EMAIL = 'support@silverishop.in';
const GOVERNING_CITY = 'Mumbai';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-silver-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <article className="bg-white rounded-2xl border border-silver-200 p-6 md:p-10 space-y-8 text-silver-700 text-sm leading-relaxed">
          <section>
            <p>
              Welcome to <span className="font-medium text-silver-900">Silveri</span>.
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
              use of <span className="font-medium text-silver-900">silverishop.in</span>{' '}
              and any purchase you make through our store. By browsing the site,
              creating an account, or placing an order, you agree to be bound by
              these Terms.
            </p>
          </section>

          <Section title="1. Eligibility">
            <p>
              You must be at least 18 years of age and capable of entering into a
              legally binding contract under Indian law to register an account or
              place an order. If you are using the store on behalf of a business,
              you confirm that you have the authority to bind that business to
              these Terms.
            </p>
          </Section>

          <Section title="2. Your account">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                You are responsible for keeping your login credentials confidential
                and for all activity under your account.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                and to update it whenever it changes.
              </li>
              <li>
                We may suspend or terminate accounts that violate these Terms,
                appear fraudulent, or are used to harm other customers.
              </li>
            </ul>
          </Section>

          <Section title="3. Products, pricing, and availability">
            <p>
              Every piece sold on Silveri is described, photographed, and priced as
              accurately as possible. Slight variation in colour, finish, or
              measurement is normal for handcrafted silver jewelry and is not a
              defect. Prices are listed in Indian rupees (₹) and include applicable
              taxes unless stated otherwise. We reserve the right to correct
              pricing or product information errors and to refuse or cancel an order
              that was placed at an obviously incorrect price.
            </p>
            <p className="mt-2">
              Stock is limited. We may withdraw or update any product at any time
              without prior notice.
            </p>
          </Section>

          <Section title="4. Orders and acceptance">
            <p>
              An order placed on the site is an offer from you to purchase the
              item(s) at the listed price. The contract is formed only when we send
              you an order confirmation email. We may decline an order — and refund
              any amount paid — if a product is unavailable, if we cannot verify
              payment, or if we suspect fraud.
            </p>
          </Section>

          <Section title="5. Payments">
            <p>
              Payments are processed by{' '}
              <span className="font-medium text-silver-900">Razorpay</span>. By
              checking out you agree to Razorpay&rsquo;s terms in addition to ours.
              We accept the payment methods supported by Razorpay (cards, UPI, net
              banking, wallets). All transactions are encrypted in transit. If a
              payment fails, the order will not be confirmed and stock will be
              released.
            </p>
          </Section>

          <Section title="6. Shipping and delivery">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Orders are dispatched within 2–5 business days of confirmation,
                excluding made-to-order or bespoke pieces.
              </li>
              <li>
                Delivery timelines depend on the courier partner and your location.
                We share a tracking link as soon as the parcel is shipped.
              </li>
              <li>Free shipping is available on orders above ₹999.</li>
              <li>
                Risk of loss passes to you when the package is delivered to the
                address you provided.
              </li>
            </ul>
          </Section>

          <Section title="7. Returns, exchanges, and refunds">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Eligible items can be returned within{' '}
                <strong className="text-silver-900">7 days</strong> of delivery,
                provided they are unused and in original packaging with tags intact.
              </li>
              <li>
                Personalised, engraved, or made-to-order items are not eligible for
                return unless they arrive damaged or defective.
              </li>
              <li>
                Refunds are issued to the original payment method within 5–10
                business days of receiving the returned item.
              </li>
              <li>
                You may cancel an unshipped order from your account or by writing
                to us. Once shipped, the return policy applies.
              </li>
            </ul>
          </Section>

          <Section title="8. Intellectual property">
            <p>
              All content on the site — product designs, photography, graphics,
              text, and the Silveri name and logo — is owned by us or our licensors
              and protected by Indian and international intellectual-property laws.
              You may not copy, reproduce, distribute, or create derivative works
              without our prior written permission.
            </p>
          </Section>

          <Section title="9. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Use the site for any unlawful or fraudulent purpose.</li>
              <li>
                Attempt to gain unauthorised access to other accounts, our servers,
                or related systems.
              </li>
              <li>
                Disrupt the site, introduce malware, or scrape content other than
                in the normal use of a browser.
              </li>
              <li>
                Resell items purchased from Silveri without our written consent.
              </li>
            </ul>
          </Section>

          <Section title="10. Reviews and submissions">
            <p>
              When you post a product review, photograph, or any other content on
              the site you grant Silveri a non-exclusive, royalty-free, worldwide
              licence to use that content for marketing and the operation of the
              store. You confirm that the content is your own and does not violate
              anyone else&rsquo;s rights.
            </p>
          </Section>

          <Section title="11. Disclaimers">
            <p>
              The site is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. While we work hard to keep the store running
              and accurate, we do not warrant that it will be uninterrupted,
              error-free, or that any defect will be corrected. Product images are
              illustrative — actual items may vary slightly because each piece is
              hand-finished.
            </p>
          </Section>

          <Section title="12. Limitation of liability">
            <p>
              To the maximum extent permitted by law, Silveri&rsquo;s total
              liability for any claim arising from your use of the site or any
              order will not exceed the amount you paid for the order in question.
              We are not liable for any indirect, incidental, or consequential
              loss.
            </p>
          </Section>

          <Section title="13. Indemnity">
            <p>
              You agree to indemnify and hold Silveri, its directors, employees,
              and agents harmless from any claim, demand, loss, or expense
              (including reasonable legal fees) arising out of your breach of
              these Terms or your misuse of the site.
            </p>
          </Section>

          <Section title="14. Governing law and disputes">
            <p>
              These Terms are governed by the laws of India. Any dispute arising
              out of or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the courts at {GOVERNING_CITY}.
            </p>
          </Section>

          <Section title="15. Changes to these Terms">
            <p>
              We may revise these Terms from time to time. The latest version will
              always be available on this page with an updated date at the top.
              Continued use of the site after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>
              For any questions about these Terms, write to{' '}
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
