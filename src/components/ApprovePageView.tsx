import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { BookingRequest } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Calendar, Clock, User, Building, FileText, ArrowLeft, ExternalLink, Lock } from 'lucide-react';

interface ApprovePageViewProps {
  token: string;
  initialAction: 'approve' | 'reject';
  onBackToQueue: () => void;
  onGoToCalendar: () => void;
}

export const ApprovePageView: React.FC<ApprovePageViewProps> = ({
  token,
  initialAction,
  onBackToQueue,
  onGoToCalendar,
}) => {
  const { bookings, processOwnerDecision, checkSlotAvailability, ownerSettings } = useBooking();
  const [action, setAction] = useState<'approve' | 'reject'>(initialAction);
  const [processing, setProcessing] = useState(false);
  const [decisionResult, setDecisionResult] = useState<{
    success: boolean;
    action?: string;
    message: string;
    conflictDetail?: string;
    meetLink?: string;
  } | null>(null);

  // Find booking by approvalToken
  const booking = bookings.find(b => b.approvalToken === token);

  // Check validity
  const isExpired = booking?.approvalExpires
    ? new Date(booking.approvalExpires).getTime() < Date.now()
    : false;
  const isInvalid = !booking || booking.status !== 'PENDING_APPROVAL' || isExpired;

  // Real-time Free/Busy check
  const availability = booking
    ? checkSlotAvailability(booking.requestedStart, booking.requestedEnd)
    : { isBusy: false };

  const handleConfirmDecision = async () => {
    if (!token) return;
    setProcessing(true);
    setDecisionResult(null);

    try {
      const res = await processOwnerDecision(token, action);
      if (res.success) {
        if (action === 'approve') {
          setDecisionResult({
            success: true,
            action: 'approved',
            message: 'Appointment approved! Google Calendar event was created, attendees were invited, and a confirmation email was dispatched.',
            meetLink: res.booking?.meetLink || undefined,
          });
        } else {
          setDecisionResult({
            success: true,
            action: 'rejected',
            message: 'Request declined. Visitor was notified politely via email. Google Calendar was not modified.',
          });
        }
      } else {
        setDecisionResult({
          success: false,
          action: res.action,
          message: res.error || 'Decision could not be finalized.',
          conflictDetail: res.conflictDetail,
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  // If already decided or invalid token
  if (isInvalid && !decisionResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Review Link Unavailable</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            This private approval token is invalid, expired (72h limit), or has already been used. No calendar event was created by opening this page.
          </p>
          <button
            onClick={onBackToQueue}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Owner Queue</span>
          </button>
        </div>
      </div>
    );
  }

  // After decision is submitted
  if (decisionResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-6">
            {decisionResult.success ? (
              decisionResult.action === 'approved' ? (
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
              )
            ) : (
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Decision Result
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {decisionResult.success
                ? decisionResult.action === 'approved'
                  ? 'Meeting Confirmed & Scheduled'
                  : 'Appointment Request Rejected'
                : 'Double-Booking Conflict Prevented'}
            </h2>
          </div>

          <div
            className={`p-4 rounded-xl text-sm leading-relaxed mb-6 ${
              decisionResult.success
                ? decisionResult.action === 'approved'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-slate-50 text-slate-800 border border-slate-200'
                : 'bg-amber-50 text-amber-950 border border-amber-200'
            }`}
          >
            {decisionResult.message}
            {decisionResult.conflictDetail && (
              <div className="mt-2 font-semibold">
                Overlapping conflict: {decisionResult.conflictDetail}
              </div>
            )}
          </div>

          {decisionResult.meetLink && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-700">Google Meet Video Room</div>
                <div className="text-xs font-mono text-emerald-700 truncate">{decisionResult.meetLink}</div>
              </div>
              <a
                href={decisionResult.meetLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-900 transition"
              >
                <span>Preview Meet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBackToQueue}
              className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
            >
              Return to Queue
            </button>
            {decisionResult.action === 'approved' && (
              <button
                onClick={onGoToCalendar}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>View on Google Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Review Screen
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                Private Owner Review Step
              </div>
              <h2 className="text-base font-bold">Appointment Approval Gate</h2>
            </div>
          </div>
          <button
            onClick={onBackToQueue}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Informational banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Security Note:</span> Merely viewing this link does not modify your calendar. Changes are only committed when you confirm the decision below via an authenticated POST request.
          </div>

          {/* Visitor Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-900 text-sm">{booking!.name}</span>
                <span className="text-xs text-slate-500">({booking!.email})</span>
              </div>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                Email Verified
              </span>
            </div>

            {booking!.company && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Company: {booking!.company}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3">
              <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Discussion Agenda / Purpose:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                "{booking!.purpose}"
              </p>
            </div>
          </div>

          {/* Time Slot & Conflict Inspector */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Google Calendar Free/Busy Check
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Requested Slot</span>
                </div>
                <div className="font-semibold text-slate-900">
                  {new Date(booking!.requestedStart).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Duration: {booking!.durationMinutes} min ({booking!.timezone})
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  availability.isBusy
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  {availability.isBusy ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Busy Conflict Detected!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Slot is 100% Free</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">
                  {availability.isBusy ? (
                    <span>
                      Overlaps with "{availability.conflictingEvent?.title}". If you confirm approval, the conflict guard will safely prevent double-booking.
                    </span>
                  ) : (
                    <span>
                      No overlapping events on primary calendar. Approving will create a Google Calendar event and dispatch invites.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Switcher & Confirm */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                  action === 'approve'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Approve & Book Meeting</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                  action === 'reject'
                    ? 'bg-red-50 border-red-600 text-red-800 ring-2 ring-red-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Reject Request</span>
              </button>
            </div>

            <button
              onClick={handleConfirmDecision}
              disabled={processing}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition flex items-center justify-center gap-2 ${
                action === 'approve'
                  ? 'bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50'
                  : 'bg-red-800 hover:bg-red-900 disabled:opacity-50'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locking record & querying Google Calendar...</span>
                </>
              ) : (
                <span>
                  Confirm {action === 'approve' ? 'Approval & Create Calendar Event' : 'Rejection (No Calendar Event)'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
