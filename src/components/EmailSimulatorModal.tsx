import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { SimulatedEmail } from '../types';
import { Mail, CheckCircle2, Clock, ExternalLink, ArrowRight, XCircle, ShieldAlert, Copy, Check, Filter } from 'lucide-react';

interface EmailSimulatorProps {
  onOpenReviewScreen?: (token: string, action: 'approve' | 'reject') => void;
}

export const EmailSimulator: React.FC<EmailSimulatorProps> = ({ onOpenReviewScreen }) => {
  const { emails, markEmailAsRead, markAllEmailsAsRead, verifyVisitorEmail, ownerSettings } = useBooking();
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'visitor' | 'owner'>('all');

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  const handleSelectEmail = (email: SimulatedEmail) => {
    setSelectedEmailId(email.id);
    if (!email.read) {
      markEmailAsRead(email.id);
    }
  };

  const handleVerifyClick = async (token: string) => {
    setVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await verifyVisitorEmail(token);
      if (res.success) {
        setVerificationFeedback('Email verified successfully! Request status updated to PENDING_APPROVAL. An approval email has now been sent to the owner.');
      } else {
        setVerificationFeedback(res.error || 'Verification failed.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredEmails = emails.filter(email => {
    if (filterType === 'visitor') return email.type === 'verification' || email.type === 'confirmation' || email.type === 'rejection' || email.type === 'conflict';
    if (filterType === 'owner') return email.type === 'owner_review';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Outgoing Email Dispatch Simulator</h2>
            <p className="text-xs text-slate-400">
              Live simulation of transactional emails dispatched via Resend API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter segment */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition ${filterType === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({emails.length})
            </button>
            <button
              onClick={() => setFilterType('visitor')}
              className={`px-2.5 py-1 rounded transition ${filterType === 'visitor' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Visitor Outbox
            </button>
            <button
              onClick={() => setFilterType('owner')}
              className={`px-2.5 py-1 rounded transition ${filterType === 'owner' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Owner Inbox
            </button>
          </div>

          <button
            onClick={markAllEmailsAsRead}
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Main Mail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Mail List (4 cols) */}
        <div className="md:col-span-5 border-r border-slate-200 bg-slate-50/50 flex flex-col">
          <div className="p-3 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Messages ({filteredEmails.length})</span>
            <span className="font-mono text-[11px]">Resend SDK Simulated</span>
          </div>

          <div className="divide-y divide-slate-200/80 overflow-y-auto max-h-[600px] flex-1">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No emails sent yet in this category. Submit a booking request to test email delivery.
              </div>
            ) : (
              filteredEmails.map(mail => {
                const isSelected = selectedEmail?.id === mail.id;
                return (
                  <button
                    key={mail.id}
                    onClick={() => handleSelectEmail(mail)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                        : mail.read
                        ? 'hover:bg-slate-100/70'
                        : 'bg-white font-medium hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {mail.to}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                        {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 line-clamp-1 font-medium">
                      {mail.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {mail.content.bodyText.replace(/\n/g, ' ')}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded font-mono ${
                          mail.type === 'verification'
                            ? 'bg-blue-100 text-blue-800'
                            : mail.type === 'owner_review'
                            ? 'bg-amber-100 text-amber-800'
                            : mail.type === 'confirmation'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mail.type.replace('_', ' ')}
                      </span>
                      {!mail.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Email Body Viewer (7 cols) */}
        <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
          {selectedEmail ? (
            <div className="space-y-6">
              {/* Email Metadata */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedEmail.subject}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(selectedEmail.sentAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-12 font-medium">From:</span>
                    <span className="font-mono text-slate-800">{selectedEmail.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 w-12 font-medium">To:</span>
                    <span className="font-mono text-slate-800">{selectedEmail.to}</span>
                  </div>
                </div>
              </div>

              {/* Rendered Email Card (Matches Resend HTML output) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-6 shadow-sm space-y-4">
                <div className="font-semibold text-slate-900 text-sm">
                  {selectedEmail.content.greeting}
                </div>

                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedEmail.content.bodyText}
                </div>

                {/* Verification Action (For Visitor verification email) */}
                {selectedEmail.type === 'verification' && selectedEmail.token && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleVerifyClick(selectedEmail.token!)}
                      disabled={verifying}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      {verifying ? (
                        <span>Validating token...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>{selectedEmail.content.actionLabel || 'Verify email and submit request'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Owner Review Actions (For Owner Review email) */}
                {selectedEmail.type === 'owner_review' && selectedEmail.token && (
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        onOpenReviewScreen
                          ? onOpenReviewScreen(selectedEmail.token!, 'approve')
                          : null
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review & Approve Request</span>
                    </button>

                    <button
                      onClick={() =>
                        onOpenReviewScreen
                          ? onOpenReviewScreen(selectedEmail.token!, 'reject')
                          : null
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Request</span>
                    </button>
                  </div>
                )}

                {/* Final Confirmation Video Call Shortcut */}
                {selectedEmail.type === 'confirmation' && (
                  <div className="pt-2">
                    <a
                      href="https://meet.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Google Meet Preview</span>
                    </a>
                  </div>
                )}

                {selectedEmail.content.notes && (
                  <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-500 italic">
                    {selectedEmail.content.notes}
                  </div>
                )}
              </div>

              {/* Feedback toast if verified */}
              {verificationFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{verificationFeedback}</span>
                </div>
              )}

              {/* Technical Security Footnote */}
              <div className="bg-slate-100/70 rounded-lg p-3 text-[11px] text-slate-600 space-y-1.5 font-mono">
                <div className="font-sans font-semibold text-slate-700 flex items-center justify-between">
                  <span>Cryptographic Token Details</span>
                  {selectedEmail.token && (
                    <button
                      onClick={() => handleCopyLink(selectedEmail.actionUrl || selectedEmail.approveUrl || '')}
                      className="text-xs font-sans text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-medium"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Copied URL' : 'Copy link'}</span>
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Token hash: </span>
                  <span className="text-slate-800 truncate block">
                    {selectedEmail.token ? `sha256(${selectedEmail.token.slice(0, 16)}...)` : 'N/A (informational)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Security Rule: </span>
                  <span className="text-slate-700">
                    Token is one-time use and stored as SHA-256 hash in database.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select an email from the left sidebar to preview content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
