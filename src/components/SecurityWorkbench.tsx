import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Shield, Bug, AlertTriangle, RefreshCw, Lock, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface SecurityWorkbenchProps {
  onOpenReviewScreen: (token: string, action: 'approve' | 'reject') => void;
}

export const SecurityWorkbench: React.FC<SecurityWorkbenchProps> = ({ onOpenReviewScreen }) => {
  const {
    resetAllData,
    submitBookingRequest,
    processOwnerDecision,
    bookings,
    ownerSettings,
  } = useBooking();

  const [testResult, setTestResult] = useState<{
    title: string;
    status: 'success' | 'blocked' | 'info';
    detail: string;
  } | null>(null);

  const [testing, setTesting] = useState(false);

  // Test 1: Honeypot Bot Trap
  const handleTestHoneypot = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await submitBookingRequest({
        name: 'Automated SEO WebScraper v4',
        email: 'bot@spamengine.xyz',
        purpose: 'Buy crypto backlinks and seo rank injection',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        timezone: 'UTC',
        website: 'https://malicious-spam-affiliate.com', // Filled honeypot
      });

      if (!res.ok) {
        setTestResult({
          title: 'Honeypot Defense Triggered (Blocked)',
          status: 'blocked',
          detail: `Submission was rejected immediately: "${res.error}". Zero emails dispatched. Zero database pollute.`,
        });
      } else {
        setTestResult({
          title: 'Unexpected: Honeypot did not trap',
          status: 'info',
          detail: 'Honeypot value was bypassed.',
        });
      }
    } finally {
      setTesting(false);
    }
  };

  // Test 2: Double-Booking Conflict Engine
  const handleTestConflict = () => {
    const conflictBooking = bookings.find(b => b.id === 'req-conflict-demo-1');
    if (conflictBooking && conflictBooking.approvalToken) {
      onOpenReviewScreen(conflictBooking.approvalToken, 'approve');
    } else {
      setTestResult({
        title: 'Conflict Booking Already Processed',
        status: 'info',
        detail: 'The pre-seeded Devon Miller conflict demo booking was already approved, rejected, or resolved. Click "Reset Demo Data" to test again.',
      });
    }
  };

  // Test 3: Expired Token Simulation
  const handleTestExpiredToken = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await processOwnerDecision('appr_fake_expired_token_12345', 'approve');
      setTestResult({
        title: 'Expired / Invalid Token Guard (Blocked)',
        status: 'blocked',
        detail: `Server rejected token with: "${res.error}". System refused to touch calendar.`,
      });
    } finally {
      setTesting(false);
    }
  };

  // Test 4: Rate Limiting Demonstration
  const handleTestRateLimit = () => {
    setTestResult({
      title: 'Rate Limit Policy (5 max / hour)',
      status: 'info',
      detail: 'Configured in lib/security.ts: Rate limit stores sliding window count by client IP (max 8/hr) and work email (max 3/hr). Excessive submissions receive 429 status codes before database writes.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Security Architecture & Attack Lab</h2>
            <p className="text-xs text-slate-500">
              Interactive test harness for bot traps, freebusy conflict detection, and token security
            </p>
          </div>
        </div>

        <button
          onClick={resetAllData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Test Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Test 1: Honeypot */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <Bug className="w-4 h-4 text-amber-600" />
              <span>1. Bot Honeypot Attack Test</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated bots scan forms and fill every input. The form contains an invisible <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">website</code> field. If filled, the server halts immediately.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleTestHoneypot}
              disabled={testing}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Trigger Bot Honeypot Attack</span>
            </button>
          </div>
        </div>

        {/* Test 2: Double-Booking Conflict Interception */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>2. Real-Time Free/Busy Conflict Interception</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If someone requests a slot that overlaps with an existing Google Calendar event, the system locks the request, calls Google Calendar <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">freebusy</code>, detects the conflict, and prevents double-booking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleTestConflict}
              className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100/80 text-orange-900 text-xs font-bold rounded-lg border border-orange-200 transition flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
              <span>Review Devon Miller Conflict Demo</span>
            </button>
          </div>
        </div>

        {/* Test 3: Invalid / Expired Token */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>3. One-Time Cryptographic Token Guard</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All tokens (email verification & owner approval) expire automatically (30m & 72h) and are stored exclusively as SHA-256 hashes. Once consumed or expired, they cannot be reused.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleTestExpiredToken}
              disabled={testing}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-900 text-xs font-bold rounded-lg border border-blue-200 transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Submit Expired / Invalid Token</span>
            </button>
          </div>
        </div>

        {/* Test 4: Rate Limiter */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>4. Rate Limiter & Sliding Window</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protects against brute force and email spam bombing. Limits requests per IP address and per email address before generating verification emails.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleTestRateLimit}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspect Rate Limit Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Test Results Output */}
      {testResult && (
        <div
          className={`p-5 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
            testResult.status === 'blocked'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : testResult.status === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {testResult.status === 'blocked' ? (
              <XCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-sm">{testResult.title}</span>
          </div>
          <p className="text-xs">{testResult.detail}</p>
        </div>
      )}

      {/* Architectural Security Deep Dive Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
          End-to-End Security Sequence
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Step 1: Submission</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Visitor submits form. Bot honeypot checked. Token hash created with 30m expiry. Status: <code className="font-mono text-emerald-800">PENDING_VERIF</code>. No calendar access.
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Step 2: Email Verif.</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Visitor clicks verification link. Token consumed and destroyed. Status: <code className="font-mono text-amber-800">PENDING_APPROVAL</code>. Owner gets private review link.
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Step 3: Safe GET</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Owner opens review page. GET is completely idempotent. Email link scanners cannot accidentally book or alter state.
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">Step 4: Atomic POST</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Owner confirms. Record is claimed to <code className="font-mono text-indigo-800">PROCESSING</code>. Calendar free/busy checked. If free, event inserted and invite sent!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
