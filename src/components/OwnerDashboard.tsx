import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { BookingRequest, BookingStatus } from '../types';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, XCircle, Search, Filter, History, Trash2, ArrowUpRight, Lock, ExternalLink, Calendar } from 'lucide-react';

interface OwnerDashboardProps {
  onOpenReviewScreen: (token: string, action: 'approve' | 'reject') => void;
  onGoToCalendar: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onOpenReviewScreen,
  onGoToCalendar,
}) => {
  const { bookings, deleteBooking, ownerSettings } = useBooking();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForAudit, setSelectedBookingForAudit] = useState<BookingRequest | null>(null);

  // Status counts
  const totalRequests = bookings.length;
  const pendingApproval = bookings.filter(b => b.status === 'PENDING_APPROVAL').length;
  const pendingVerification = bookings.filter(b => b.status === 'PENDING_VERIFICATION').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const conflictsCount = bookings.filter(b => b.status === 'CONFLICT').length;

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.company && b.company.toLowerCase().includes(q)) ||
        b.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Ready for Approval</span>
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
            <Lock className="w-3 h-3 text-blue-700" />
            <span>Awaiting Email Verif.</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Approved & Scheduled</span>
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-700" />
            <span>Calendar Conflict</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Declined</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
            <div className="w-2.5 h-2.5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
            <span>Processing Claim</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Ready for Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {pendingApproval}
            </span>
            <span className="text-xs text-slate-400">verified by visitor</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Awaiting Verification</span>
            <Lock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {pendingVerification}
            </span>
            <span className="text-xs text-slate-400">link in inbox</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Scheduled on GCal</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {approvedCount}
            </span>
            <span className="text-xs text-slate-400">confirmed meetings</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Conflicts Blocked</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {conflictsCount}
            </span>
            <span className="text-xs text-slate-400">freebusy caught</span>
          </div>
        </div>
      </div>

      {/* Main Table Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Appointment Request Queue</h2>
            <p className="text-xs text-slate-500">
              Every request requires deliberate owner review before Google Calendar event insertion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visitor, email, purpose..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-lg w-full sm:w-60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">All Statuses ({totalRequests})</option>
              <option value="PENDING_APPROVAL">Pending Approval ({pendingApproval})</option>
              <option value="PENDING_VERIFICATION">Pending Verification ({pendingVerification})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="CONFLICT">Conflicts ({conflictsCount})</option>
              <option value="REJECTED">Declined</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Visitor & Company</th>
                <th className="py-3 px-4">Agenda / Purpose</th>
                <th className="py-3 px-4">Requested Time</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No appointment requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => {
                  const hasApprovalToken = Boolean(booking.approvalToken);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{booking.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{booking.email}</div>
                        {booking.company && (
                          <div className="text-slate-400 text-[10px]">{booking.company}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-700 leading-relaxed" title={booking.purpose}>
                          {booking.purpose}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(booking.requestedStart).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {new Date(booking.requestedStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({booking.durationMinutes}m)
                        </div>
                        <div className="text-slate-400 text-[10px]">{booking.timezone}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {booking.status === 'PENDING_APPROVAL' && hasApprovalToken ? (
                            <button
                              onClick={() => onOpenReviewScreen(booking.approvalToken!, 'approve')}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded text-xs transition flex items-center gap-1 shadow-sm"
                            >
                              <span>Review</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          ) : booking.status === 'APPROVED' ? (
                            <button
                              onClick={onGoToCalendar}
                              className="px-2 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-medium transition flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => setSelectedBookingForAudit(booking)}
                            title="View Lifecycle Audit Log"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteBooking(booking.id)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Modal / Drawer */}
      {selectedBookingForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Security & Lifecycle Audit Trail</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForAudit(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="font-semibold text-slate-900">{selectedBookingForAudit.name}</div>
                <div className="text-slate-500 font-mono">{selectedBookingForAudit.email}</div>
                <div className="text-slate-600 mt-1">"{selectedBookingForAudit.purpose}"</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-mono">
                  Event Sequence
                </h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {selectedBookingForAudit.auditLogs.map((log, idx) => (
                    <div key={idx} className="relative pl-7 text-xs">
                      <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 font-mono text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{log.detail}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        actor: {log.actor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBookingForAudit(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
