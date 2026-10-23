/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { BookingWidget } from './components/BookingWidget';
import { EmailSimulator } from './components/EmailSimulatorModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CalendarView } from './components/CalendarView';
import { EmbedGenerator } from './components/EmbedGenerator';
import { SecurityWorkbench } from './components/SecurityWorkbench';
import { ApprovePageView } from './components/ApprovePageView';
import { ActiveTab } from './types';
import { ShieldCheck, Calendar, Lock, CheckCircle2, ArrowRight, Zap, Sparkles, X } from 'lucide-react';

import { Logo } from './components/Logo';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('booking');
  const [activeReview, setActiveReview] = useState<{ token: string; action: 'approve' | 'reject' } | null>(null);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const { pendingApprovalCount, unreadEmailCount, ownerSettings } = useBooking();

  const handleOpenReview = (token: string, action: 'approve' | 'reject') => {
    setActiveReview({ token, action });
  };

  const handleCloseReview = () => {
    setActiveReview(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 3-Zone Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveReview(null);
          setActiveTab(tab);
        }}
        onOpenQuickBooking={() => setShowQuickModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* If Active Review Screen is open */}
        {activeReview ? (
          <ApprovePageView
            token={activeReview.token}
            initialAction={activeReview.action}
            onBackToQueue={() => {
              setActiveReview(null);
              setActiveTab('admin');
            }}
            onGoToCalendar={() => {
              setActiveReview(null);
              setActiveTab('calendar');
            }}
          />
        ) : (
          <>
            {/* View 1: Public Booking Page (Visitor View) */}
            {activeTab === 'booking' && (
              <div className="space-y-10 max-w-4xl mx-auto">
                {/* Hero Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Protected Calendar · Manual Review Required</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
                    Let's find a time to talk.
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Submit an appointment request below. To protect my schedule from calendar spam, every request is verified by email and reviewed manually. Your meeting is booked only after approval.
                  </p>
                </div>

                {/* The Core Booking Widget */}
                <BookingWidget
                  onSuccessNavigateToInbox={() => setActiveTab('inbox')}
                />

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
                      01
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Email Verification
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Visitors receive a one-time link expiring in 30 minutes. Prevents fake bookings and invalid contact emails before anything touches the calendar.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
                      02
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Safe One-Time Approval Links
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Owners review requests on a secure preview page. Opening the email link performs a GET preview only; actions require explicit confirmation.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
                      03
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Google Free/Busy Conflict Check
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Availability is re-checked against Google Calendar at the exact moment of approval. Double-booking is automatically intercepted.
                    </p>
                  </div>
                </div>

                {/* Simulator Guided Walkthrough Banner */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Interactive Demo Mode</span>
                    </div>
                    <h3 className="text-lg font-bold">
                      Explore the entire email and calendar workflow
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      We have pre-seeded test bookings ready for review, including incoming email simulator, freebusy conflict interceptor, and Google Calendar live schedule.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <span>Simulate Inbox</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                    >
                      Owner Queue ({pendingApprovalCount})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Simulated Email Inbox */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                <EmailSimulator onOpenReviewScreen={handleOpenReview} />
              </div>
            )}

            {/* View 3: Owner Queue & Management */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <OwnerDashboard
                  onOpenReviewScreen={handleOpenReview}
                  onGoToCalendar={() => setActiveTab('calendar')}
                />
              </div>
            )}

            {/* View 4: Google Calendar View */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <CalendarView />
              </div>
            )}

            {/* View 5: Embed & Code Snippet Generator */}
            {activeTab === 'embed' && (
              <div className="space-y-6">
                <EmbedGenerator />
              </div>
            )}

            {/* View 6: Security & Bot Attack Lab */}
            {activeTab === 'workbench' && (
              <div className="space-y-6">
                <SecurityWorkbench onOpenReviewScreen={handleOpenReview} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick Booking Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-sm">Create Test Booking Request</h3>
              <button
                onClick={() => setShowQuickModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <BookingWidget
                onSuccessNavigateToInbox={() => {
                  setShowQuickModal(false);
                  setActiveTab('inbox');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clean, quiet footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <Logo variant="primary" height={22} className="h-5 w-auto" />
            <span>·</span>
            <span>Deliberate manual approval before calendar event creation</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('workbench')}
              className="hover:text-slate-900 transition"
            >
              Security Lab
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('embed')}
              className="hover:text-slate-900 transition"
            >
              Embed Snippet
            </button>
            <span>·</span>
            <span className="font-mono text-slate-400">Google Calendar API v3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BookingProvider>
      <MainAppContent />
    </BookingProvider>
  );
}
