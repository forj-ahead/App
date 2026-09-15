export const metadata = { title: 'Terms of Service — Forj' }

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-slate-200">
      <h1 className="text-2xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: August 4, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
        <p className="text-slate-300 leading-relaxed">
          By accessing or using the Forj platform, you agree to be bound by these Terms of Service.
          If you do not agree, do not use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">2. Service Description</h2>
        <p className="text-slate-300 leading-relaxed">
          Forj provides AI-powered call answering, lead qualification, and lead management tools for
          small businesses. The service includes an AI voice agent, lead scoring dashboard, call
          transcripts, and SMS alert notifications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">3. SMS Notifications</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          By enabling SMS alerts in your Forj account, you consent to receive automated text
          messages regarding lead activity for your business. These messages are sent to the phone
          number(s) you designate in your account settings.
        </p>
        <p className="text-slate-300 leading-relaxed mb-3">
          Message frequency depends on your call volume. <strong className="text-white">Message
          and data rates may apply.</strong>
        </p>
        <p className="text-slate-300 leading-relaxed">
          To opt out of SMS notifications, reply STOP to any message or disable alerts in your
          dashboard. For help, reply HELP or contact support@forjahead.com.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">4. User Responsibilities</h2>
        <p className="text-slate-300 leading-relaxed">
          You are responsible for maintaining the security of your account credentials and ensuring
          that designated alert recipients have consented to receive SMS messages. You agree to use
          the platform only for lawful business purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">5. Payment</h2>
        <p className="text-slate-300 leading-relaxed">
          Forj is a subscription service. By subscribing, you authorize recurring charges to your
          payment method on the billing cycle you select. Subscriptions auto-renew until cancelled.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">6. Limitation of Liability</h2>
        <p className="text-slate-300 leading-relaxed">
          Forj is provided "as is." We are not liable for missed calls, undelivered messages, or
          business losses resulting from service interruptions. Our total liability is limited to
          fees paid in the prior 30 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
        <p className="text-slate-300 leading-relaxed">
          Questions about these terms:{' '}
          <a href="mailto:support@forjahead.com" className="text-blue-400 hover:underline">
            support@forjahead.com
          </a>
        </p>
      </section>
    </div>
  )
}
