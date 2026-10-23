import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, Clock, Video, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addManualCalendarBlock, deleteCalendarEvent, ownerSettings } = useBooking();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:00');

  // Group events by date
  const eventsByDate = calendarEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const dateKey = new Date(event.start).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort();

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [year, month, day] = newDate.split('-').map(Number);
    const [startH, startM] = newStartTime.split(':').map(Number);
    const [endH, endM] = newEndTime.split(':').map(Number);

    const start = new Date(year, month - 1, day, startH, startM).toISOString();
    const end = new Date(year, month - 1, day, endH, endM).toISOString();

    addManualCalendarBlock(newTitle.trim(), start, end);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Google Calendar Schedule</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>API v3 Synced</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Primary calendar of <span className="font-medium text-slate-700">{ownerSettings.ownerEmail}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Busy Block (Test Conflict)</span>
        </button>
      </div>

      {/* Calendar Days Feed */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No events scheduled on the primary calendar.
          </div>
        ) : (
          sortedDates.map(dateKey => {
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dayEvents = eventsByDate[dateKey].sort(
              (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
            );

            return (
              <div key={dateKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-800 flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-slate-900">
                      {dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'})
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {dayEvents.map(event => {
                    const startFormatted = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endFormatted = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={event.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-10 rounded-full mt-0.5 shrink-0 ${
                              event.isExternalBusyBlock ? 'bg-slate-400' : 'bg-emerald-600'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                              {event.isExternalBusyBlock ? (
                                <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Internal Busy Block
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Approved via MINTWORK
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1 whitespace-pre-line line-clamp-2">
                              {event.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-mono tabular-nums font-medium text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {startFormatted} – {endFormatted}
                              </span>

                              {event.attendeeEmail && (
                                <span className="text-slate-500">
                                  Attendee: <span className="text-slate-700 font-medium">{event.attendeeEmail}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!event.isExternalBusyBlock && (
                            <a
                              href="https://meet.google.com"
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Meet Link</span>
                            </a>
                          )}
                          <button
                            onClick={() => deleteCalendarEvent(event.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Remove event from calendar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Busy Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Busy Block to Calendar</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Block Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focus Time, Dental Appointment, Team Offsite"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tip: Adding a block during a time someone requested will allow you to test how the freebusy conflict detection stops double-booking during owner review!
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
