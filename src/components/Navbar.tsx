import React from 'react';
import { ActiveTab } from '../types';
import { useBooking } from '../context/BookingContext';
import { Calendar, Inbox, ShieldCheck, Code, Sliders, CheckCircle2 } from 'lucide-react';

import { Logo } from './Logo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickBooking,
}) => {
  const { unreadEmailCount, pendingApprovalCount } = useBooking();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark with approved MINTWORK logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('booking')}
              className="text-left flex items-center transition-opacity hover:opacity-90"
              aria-label="MINTWORK Home"
            >
              <Logo variant="primary" height={28} className="h-7 w-auto" />
            </button>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
              v1.0 starter
            </span>
          </div>

          {/* Zone 2: 4-5 single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('booking')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
                activeTab === 'booking'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              Public Widget
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 relative ${
                activeTab === 'inbox'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Email Simulator</span>
              {unreadEmailCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 relative ${
                activeTab === 'admin'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Owner Queue</span>
              {pendingApprovalCount > 0 && (
                <span className="w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {pendingApprovalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
                activeTab === 'calendar'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Google Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('embed')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
                activeTab === 'embed'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Embed Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('workbench')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 ${
                activeTab === 'workbench'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Security Lab</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuickBooking}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Test New Booking
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('booking')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === 'booking' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Widget
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`whitespace-nowrap px-2.5 py-1 rounded flex items-center gap-1 ${
              activeTab === 'inbox' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Emails ({unreadEmailCount})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap px-2.5 py-1 rounded flex items-center gap-1 ${
              activeTab === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Queue ({pendingApprovalCount})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === 'calendar' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === 'embed' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Embed
          </button>
          <button
            onClick={() => setActiveTab('workbench')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === 'workbench' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Security
          </button>
        </div>
      </div>
    </header>
  );
};
