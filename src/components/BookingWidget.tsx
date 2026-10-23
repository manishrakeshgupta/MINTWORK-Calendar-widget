import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Calendar, Clock, Globe, Shield, ArrowRight, AlertCircle, CheckCircle, Info, Bug } from 'lucide-react';

interface BookingWidgetProps {
  onSuccessNavigateToInbox?: () => void;
  compactMode?: boolean;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  onSuccessNavigateToInbox,
  compactMode = false,
}) => {
  const { submitBookingRequest, ownerSettings } = useBooking();

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 30,
    timezone: 'Asia/Kolkata',
    website: '', // Honeypot
    turnstileToken: 'cf-turnstile-simulated-token-ok',
  });

  const [busy, setBusy] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHoneypotInspector, setShowHoneypotInspector] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResultMessage(null);

    try {
      const res = await submitBookingRequest({
        ...form,
        durationMinutes: Number(form.durationMinutes),
      });

      if (!res.ok) {
        setResultMessage({
          type: 'error',
          text: res.error || 'Could not submit your appointment request.',
        });
      } else {
        setResultMessage({
          type: 'success',
          text: 'Request received! A one-time verification link has been dispatched to your inbox. Please verify your email to submit for review.',
        });
        // Clear form
        setForm({
          name: '',
          email: '',
          company: '',
          purpose: '',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          durationMinutes: 30,
          timezone: form.timezone,
          website: '',
          turnstileToken: 'cf-turnstile-simulated-token-ok',
        });
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleFillDemoVisitor = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setForm({
      name: 'Samantha Ray',
      email: 'samantha.ray@fintechscale.io',
      company: 'FinTech Scale Ltd',
      purpose: 'Technical evaluation of your automated calendar approval workflow and enterprise security compliance.',
      date: tomorrow.toISOString().split('T')[0],
      time: '15:30',
      durationMinutes: 30,
      timezone: 'America/New_York',
      website: '',
      turnstileToken: 'cf-turnstile-simulated-token-ok',
    });
    setResultMessage(null);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm ${compactMode ? 'p-5' : 'p-6 sm:p-8'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Appointment Request
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Request time with {ownerSettings.ownerName}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleFillDemoVisitor}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-md transition-colors self-start sm:self-auto"
        >
          Autofill Sample Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Samantha Ray"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>
        </div>

        {/* Row 2: Company (Optional) */}
        <div>
          <label htmlFor="company" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            maxLength={120}
            placeholder="e.g. FinTech Scale Ltd"
            value={form.company}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
          />
        </div>

        {/* Row 3: Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-xs font-semibold text-slate-700 mb-1.5">
            What would you like to discuss? <span className="text-red-500">*</span>
          </label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            required
            maxLength={1200}
            placeholder="Provide context, agenda items, or questions you would like to address during our discussion..."
            value={form.purpose}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition resize-y"
          />
        </div>

        {/* Row 4: Date, Time, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="date"
                name="date"
                type="date"
                required
                min={new Date().toLocaleDateString('en-CA')}
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <input
              id="time"
              name="time"
              type="time"
              required
              value={form.time}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label htmlFor="durationMinutes" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Duration
            </label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
        </div>

        {/* Row 5: Time Zone */}
        <div>
          <label htmlFor="timezone" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Your Time Zone
          </label>
          <div className="relative">
            <select
              id="timezone"
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            >
              <option value="Asia/Kolkata">India Standard Time (IST - UTC+5:30)</option>
              <option value="America/New_York">US Eastern Time (ET)</option>
              <option value="America/Chicago">US Central Time (CT)</option>
              <option value="America/Denver">US Mountain Time (MT)</option>
              <option value="America/Los_Angeles">US Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT / BST)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
              <option value="Asia/Singapore">Singapore / Hong Kong (SGT)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
              <option value="Pacific/Auckland">Auckland (NZST)</option>
              <option value="UTC">Universal Coordinated Time (UTC)</option>
            </select>
          </div>
        </div>

        {/* Hidden Honeypot Field (Bot Trap) */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
        >
          <label htmlFor="website">Do not fill this field</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        {/* Honeypot Testing Toggle (For Developer demonstration) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowHoneypotInspector(!showHoneypotInspector)}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
          >
            <Bug className="w-3 h-3" />
            <span>{showHoneypotInspector ? 'Hide Bot Trap Inspector' : 'Test Bot Honeypot Trap'}</span>
          </button>
          {showHoneypotInspector && (
            <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900">
              <p className="font-medium mb-1">Honeypot Bot Trap Demonstration:</p>
              <p className="text-amber-800 mb-2">
                Real human visitors cannot see this field. If an automated web scraper or bot populates it, the server silently flags and rejects the submission with a 400 error.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type anything here to simulate a spam bot..."
                  value={form.website}
                  onChange={handleChange}
                  name="website"
                  className="px-2.5 py-1 border border-amber-300 rounded text-xs bg-white w-full max-w-xs focus:ring-1 focus:ring-amber-500"
                />
                {form.website && (
                  <span className="text-[11px] font-bold text-red-600 whitespace-nowrap">
                    Bot payload armed!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Policy note */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-800">Two-Step Verification Policy:</span> We will email you a secure confirmation link. Verifying your email validates your identity and submits the request to {ownerSettings.ownerName} for manual review. No calendar event is added automatically.
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
          >
            {busy ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting request...</span>
              </>
            ) : (
              <>
                <span>Request Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Results Banner */}
        {resultMessage && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {resultMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="font-medium leading-relaxed">{resultMessage.text}</div>
            </div>
            {resultMessage.type === 'success' && onSuccessNavigateToInbox && (
              <button
                type="button"
                onClick={onSuccessNavigateToInbox}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors"
              >
                Open Simulated Inbox →
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
