export const metadata = { title: 'SMS Alerts Opt-In — Forj' }

export default function SmsConsentPage() {
  return (
    <div className="min-h-screen bg-[#080F1E] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0D1525] border border-white/[0.06] rounded-2xl p-6 space-y-5">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">SMS Lead Alerts</h1>
            <p className="text-white/40 text-xs">Forj — forjahead.com</p>
          </div>
        </div>

        <p className="text-white/50 text-xs leading-relaxed">
          Get a text message the moment a qualified lead calls your business.
          Enter your mobile number below and enable alerts.
        </p>

        <div>
          <label className="block text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
            Mobile number to receive alerts
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="+1 (703) 555-1234"
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-white/70 placeholder:text-white/20 text-xs focus:outline-none focus:border-white/20"
              readOnly
            />
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-medium">
              + Add
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <div className="w-4 h-4 rounded border border-white/20 bg-white/[0.03] flex-shrink-0 mt-0.5" />
          <span className="text-white/30 text-[10px] leading-relaxed">
            I agree to receive automated SMS lead alert notifications from Forj at the number(s) above.
            Message frequency varies based on call volume — up to one message per qualifying inbound call.
            Msg&amp;Data rates may apply. Reply <strong className="text-white/50">STOP</strong> to opt out at any time.
            Reply <strong className="text-white/50">HELP</strong> for help.{' '}
            <a href="https://app.forjahead.com/privacy" className="text-white/50 underline">Privacy Policy</a>
            {' · '}
            <a href="https://app.forjahead.com/terms" className="text-white/50 underline">Terms of Service</a>
          </span>
        </label>

        <button
          className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-500/30 border border-emerald-500/30 text-emerald-300/50 cursor-not-allowed"
          disabled
        >
          Yes, enable SMS alerts
        </button>

        <p className="text-white/20 text-[10px] text-center">
          You can disable alerts at any time from your Forj dashboard settings.
        </p>
      </div>
    </div>
  )
}
