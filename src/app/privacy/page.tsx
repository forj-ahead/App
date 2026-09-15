export const metadata = { title: 'Privacy Policy — Forj' }

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-slate-200">
      <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: August 4, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">SMS Messaging</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          Forj provides an AI-powered call answering and lead management platform. As part of this
          service, we may send SMS notifications to business owners and their designated contacts
          regarding inbound leads and call activity.
        </p>
        <p className="text-slate-300 leading-relaxed mb-3">
          <strong className="text-white">Non-sharing of mobile numbers:</strong> We will not share,
          sell, rent, or trade your mobile phone number with any third party for their marketing
          purposes. Mobile numbers collected for SMS notifications are used solely to deliver
          lead alerts and service notifications on behalf of your business.
        </p>
        <p className="text-slate-300 leading-relaxed mb-3">
          <strong className="text-white">Message frequency:</strong> Message frequency varies based
          on call volume to your business. You may receive up to one SMS per qualifying inbound
          call received by your AI agent.
        </p>
        <p className="text-slate-300 leading-relaxed mb-3">
          <strong className="text-white">Message and data rates may apply.</strong> Contact your
          mobile carrier for details on your plan's messaging and data rates.
        </p>
        <p className="text-slate-300 leading-relaxed">
          <strong className="text-white">Text Messaging:</strong> By providing your phone number,
          you consent to receive transactional SMS notifications related to your Forj account.
          Message frequency varies with your call volume. Message and data rates may apply. You can
          opt out at any time by replying STOP, or get help by replying HELP. We do not share your
          mobile number or opt-in information with third parties for marketing purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Information We Collect</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          We collect information you provide when creating an account, including your name, email
          address, business name, and phone number. We also collect call data from your AI agent,
          including transcripts, caller information, and call recordings, to provide lead scoring
          and management services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">How We Use Your Information</h2>
        <p className="text-slate-300 leading-relaxed">
          We use your information to provide and improve the Forj platform, send lead notifications
          via SMS, and support your account. We do not sell personal information to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Opt-Out</h2>
        <p className="text-slate-300 leading-relaxed">
          To stop receiving SMS notifications, reply STOP to any message or contact us at{' '}
          <a href="mailto:support@forjahead.com" className="text-blue-400 hover:underline">
            support@forjahead.com
          </a>
          . You can also disable SMS alerts at any time in your Forj dashboard settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
        <p className="text-slate-300 leading-relaxed">
          For questions about this privacy policy, contact us at{' '}
          <a href="mailto:support@forjahead.com" className="text-blue-400 hover:underline">
            support@forjahead.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
