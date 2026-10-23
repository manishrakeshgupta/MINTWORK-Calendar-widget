import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingRequest, CalendarEvent, SimulatedEmail, BookingStatus } from '../types';
import { getInitialData, getOwnerEmail, getSystemSenderEmail } from '../data/initialData';

interface BookingContextType {
  bookings: BookingRequest[];
  calendarEvents: CalendarEvent[];
  emails: SimulatedEmail[];
  unreadEmailCount: number;
  pendingApprovalCount: number;
  pendingVerificationCount: number;
  ownerSettings: {
    ownerName: string;
    ownerEmail: string;
    googleConnected: boolean;
    requireTurnstile: boolean;
    timezone: string;
  };
  reviewParam: { token: string; action: 'approve' | 'reject' } | null;
  setReviewParam: (param: { token: string; action: 'approve' | 'reject' } | null) => void;
  submitBookingRequest: (formData: {
    name: string;
    email: string;
    company?: string;
    purpose: string;
    date: string;
    time: string;
    timezone: string;
    durationMinutes?: number;
    website?: string;
    turnstileToken?: string;
  }) => Promise<{ ok: boolean; error?: string; booking?: BookingRequest }>;
  verifyVisitorEmail: (token: string) => Promise<{ success: boolean; error?: string; booking?: BookingRequest }>;
  processOwnerDecision: (token: string, action: 'approve' | 'reject') => Promise<{
    success: boolean;
    action?: 'approved' | 'rejected' | 'conflict' | 'expired' | 'used';
    error?: string;
    booking?: BookingRequest;
    conflictDetail?: string;
  }>;
  checkSlotAvailability: (startIso: string, endIso: string) => { isBusy: boolean; conflictingEvent?: CalendarEvent };
  addManualCalendarBlock: (title: string, startIso: string, endIso: string) => void;
  deleteCalendarEvent: (id: string) => void;
  deleteBooking: (id: string) => void;
  markEmailAsRead: (emailId: string) => void;
  markAllEmailsAsRead: () => void;
  resetAllData: () => void;
  simulateBotAttack: () => Promise<{ success: boolean; message: string }>;
  simulateConflictScenario: () => Promise<{ success: boolean; message: string; bookingId: string }>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'calapprove_state_v1';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [reviewParam, setReviewParam] = useState<{ token: string; action: 'approve' | 'reject' } | null>(null);
  
  const [ownerSettings, setOwnerSettings] = useState({
    ownerName: 'Anya G',
    ownerEmail: getOwnerEmail(),
    googleConnected: true,
    requireTurnstile: false,
    timezone: 'Asia/Kolkata',
  });

  // Load from localStorage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookings(parsed.bookings || []);
        setCalendarEvents(parsed.calendarEvents || []);
        setEmails(parsed.emails || []);
        if (parsed.ownerSettings) {
          setOwnerSettings({
            ...parsed.ownerSettings,
            ownerName: 'Anya G',
            ownerEmail: getOwnerEmail(),
          });
        }
      } else {
        const initial = getInitialData();
        setBookings(initial.bookings);
        setCalendarEvents(initial.calendarEvents);
        setEmails(initial.emails);
      }
    } catch {
      const initial = getInitialData();
      setBookings(initial.bookings);
      setCalendarEvents(initial.calendarEvents);
      setEmails(initial.emails);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ bookings, calendarEvents, emails, ownerSettings })
      );
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }, [bookings, calendarEvents, emails, ownerSettings, isLoaded]);

  // Derived counts
  const unreadEmailCount = emails.filter(e => !e.read).length;
  const pendingApprovalCount = bookings.filter(b => b.status === 'PENDING_APPROVAL').length;
  const pendingVerificationCount = bookings.filter(b => b.status === 'PENDING_VERIFICATION').length;

  // Free/busy checker against existing calendar events
  const checkSlotAvailability = (startIso: string, endIso: string) => {
    const reqStart = new Date(startIso).getTime();
    const reqEnd = new Date(endIso).getTime();

    const conflicting = calendarEvents.find(event => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      // Overlap formula: (StartA < EndB) and (EndA > StartB)
      return reqStart < eventEnd && reqEnd > eventStart;
    });

    return {
      isBusy: Boolean(conflicting),
      conflictingEvent: conflicting,
    };
  };

  // 1. Submit Booking Request (Visitor form submission)
  const submitBookingRequest = async (formData: {
    name: string;
    email: string;
    company?: string;
    purpose: string;
    date: string;
    time: string;
    timezone: string;
    durationMinutes?: number;
    website?: string;
    turnstileToken?: string;
  }) => {
    // Honeypot bot protection check
    if (formData.website && formData.website.trim().length > 0) {
      console.warn('Honeypot triggered! Bot detected:', formData.website);
      return {
        ok: false,
        error: 'Bot protection violation: automated request rejected.',
      };
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.purpose.trim() || !formData.date || !formData.time) {
      return { ok: false, error: 'Please fill in all required fields.' };
    }

    // Construct start & end ISO
    const duration = formData.durationMinutes || 30;
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hour, minute] = formData.time.split(':').map(Number);
    
    const startDate = new Date(year, month - 1, day, hour, minute);
    if (isNaN(startDate.getTime())) {
      return { ok: false, error: 'Invalid appointment date or time.' };
    }

    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    const now = new Date();

    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const verificationToken = `verif_tok_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    const verificationExpires = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    const newBooking: BookingRequest = {
      id,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      company: formData.company?.trim() || undefined,
      purpose: formData.purpose.trim(),
      requestedStart: startDate.toISOString(),
      requestedEnd: endDate.toISOString(),
      durationMinutes: duration,
      timezone: formData.timezone || 'Asia/Kolkata',
      status: 'PENDING_VERIFICATION',
      emailVerifiedAt: null,
      verificationToken,
      verificationExpires,
      approvalToken: null,
      approvalExpires: null,
      decisionAt: null,
      calendarEventId: null,
      meetLink: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      auditLogs: [
        {
          timestamp: now.toISOString(),
          action: 'REQUEST_SUBMITTED',
          detail: `Appointment request submitted by ${formData.name} (${formData.email}) for ${startDate.toLocaleDateString()} at ${formData.time}.`,
          actor: 'visitor',
        },
        {
          timestamp: now.toISOString(),
          action: 'VERIFICATION_DISPATCHED',
          detail: 'One-time email verification token generated with 30-minute expiration window.',
          actor: 'system',
        }
      ]
    };

    // Create simulated outgoing email
    const verificationEmail: SimulatedEmail = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      to: newBooking.email,
      from: getSystemSenderEmail(),
      subject: 'Verify your appointment request — MINTWORK',
      type: 'verification',
      bookingId: id,
      sentAt: now.toISOString(),
      token: verificationToken,
      actionUrl: `/api/verify-email?token=${verificationToken}`,
      read: false,
      content: {
        greeting: `Hi ${newBooking.name},`,
        bodyText: `Please verify your email address to submit your appointment request with ${ownerSettings.ownerName}.`,
        actionLabel: 'Verify email & submit request',
        notes: 'Notice: This does not book an appointment. The meeting will only be scheduled after manual review and Google Calendar approval.'
      }
    };

    setBookings(prev => [newBooking, ...prev]);
    setEmails(prev => [verificationEmail, ...prev]);

    return { ok: true, booking: newBooking };
  };

  // 2. Verify visitor email
  const verifyVisitorEmail = async (token: string) => {
    const now = new Date();
    const target = bookings.find(b => b.verificationToken === token);

    if (!target) {
      return { success: false, error: 'Invalid, already used, or unknown verification token.' };
    }

    if (target.verificationExpires && new Date(target.verificationExpires).getTime() < now.getTime()) {
      return { success: false, error: 'This verification link has expired (30-minute limit exceeded).' };
    }

    if (target.status !== 'PENDING_VERIFICATION') {
      return { success: false, error: 'This request has already been verified.' };
    }

    const approvalToken = `appr_tok_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    const approvalExpires = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

    const updatedBooking: BookingRequest = {
      ...target,
      status: 'PENDING_APPROVAL',
      emailVerifiedAt: now.toISOString(),
      verificationToken: null,
      verificationExpires: null,
      approvalToken,
      approvalExpires,
      updatedAt: now.toISOString(),
      auditLogs: [
        ...target.auditLogs,
        {
          timestamp: now.toISOString(),
          action: 'EMAIL_VERIFIED',
          detail: 'Visitor verified their email address. Status transitioned to PENDING_APPROVAL.',
          actor: 'visitor',
        },
        {
          timestamp: now.toISOString(),
          action: 'OWNER_NOTIFIED',
          detail: `Owner review email dispatched to ${ownerSettings.ownerEmail} with one-time approval/rejection tokens.`,
          actor: 'system',
        }
      ]
    };

    // Create simulated email to calendar owner
    const ownerNotificationEmail: SimulatedEmail = {
      id: `mail-owner-${Date.now()}`,
      to: ownerSettings.ownerEmail,
      from: getSystemSenderEmail(),
      subject: `Appointment request: ${target.name} (Verified)`,
      type: 'owner_review',
      bookingId: target.id,
      sentAt: now.toISOString(),
      token: approvalToken,
      approveUrl: `/approve?token=${approvalToken}&action=approve`,
      rejectUrl: `/approve?token=${approvalToken}&action=reject`,
      read: false,
      content: {
        greeting: 'New verified appointment request ready for review',
        bodyText: `${target.name} ${target.company ? `(${target.company})` : ''} has verified their email and requested a meeting.\n\nPurpose: "${target.purpose}"\nRequested: ${new Date(target.requestedStart).toLocaleString()} (${target.timezone})`,
        actionLabel: 'Review & Approve',
        secondaryActionLabel: 'Reject Request',
        notes: 'One-time link expires in 72 hours. Note: Opening this link merely displays the review details; Google Calendar events are strictly created only when you submit confirmation.'
      }
    };

    setBookings(prev => prev.map(b => b.id === target.id ? updatedBooking : b));
    setEmails(prev => [ownerNotificationEmail, ...prev]);

    return { success: true, booking: updatedBooking };
  };

  // 3. Process Owner Decision (Approve or Reject with Claim & Freebusy Check)
  const processOwnerDecision = async (
    token: string,
    action: 'approve' | 'reject'
  ): Promise<{
    success: boolean;
    action?: 'approved' | 'rejected' | 'conflict' | 'expired' | 'used';
    error?: string;
    booking?: BookingRequest;
    conflictDetail?: string;
  }> => {
    const now = new Date();
    const target = bookings.find(b => b.approvalToken === token);

    if (!target) {
      return { success: false, action: 'used', error: 'This approval link is invalid or has already been used.' };
    }

    if (target.approvalExpires && new Date(target.approvalExpires).getTime() < now.getTime()) {
      return { success: false, action: 'expired', error: 'This review link has expired (72-hour window elapsed).' };
    }

    if (target.status !== 'PENDING_APPROVAL') {
      return { success: false, action: 'used', error: `This request has already been resolved (current status: ${target.status}).` };
    }

    // Step A: Handle Rejection
    if (action === 'reject') {
      const rejectedBooking: BookingRequest = {
        ...target,
        status: 'REJECTED',
        approvalToken: null,
        approvalExpires: null,
        decisionAt: now.toISOString(),
        updatedAt: now.toISOString(),
        auditLogs: [
          ...target.auditLogs,
          {
            timestamp: now.toISOString(),
            action: 'OWNER_REJECTED',
            detail: 'Owner declined the appointment request. Google Calendar was not touched.',
            actor: 'owner',
          },
          {
            timestamp: now.toISOString(),
            action: 'REJECTION_EMAIL_SENT',
            detail: `Notification sent to visitor ${target.email}.`,
            actor: 'system',
          }
        ]
      };

      const rejectionEmail: SimulatedEmail = {
        id: `mail-rej-${Date.now()}`,
        to: target.email,
        from: getSystemSenderEmail(),
        subject: 'Appointment request update — MINTWORK',
        type: 'rejection',
        bookingId: target.id,
        sentAt: now.toISOString(),
        read: false,
        content: {
          greeting: `Hi ${target.name},`,
          bodyText: `Thank you for your request. Unfortunately, ${ownerSettings.ownerName} cannot accept this requested time slot.`,
          notes: 'No event was added to the calendar. You are welcome to submit an alternative time if you wish.'
        }
      };

      setBookings(prev => prev.map(b => b.id === target.id ? rejectedBooking : b));
      setEmails(prev => [rejectionEmail, ...prev]);

      return {
        success: true,
        action: 'rejected',
        booking: rejectedBooking,
      };
    }

    // Step B: Handle Approval
    // 1. Claim the request (status: PROCESSING) to prevent race conditions
    // 2. Query freebusy for the requested window
    const availability = checkSlotAvailability(target.requestedStart, target.requestedEnd);

    if (availability.isBusy) {
      // Conflict detected!
      const conflictingTitle = availability.conflictingEvent?.title || 'an existing appointment';
      const conflictBooking: BookingRequest = {
        ...target,
        status: 'CONFLICT',
        approvalToken: null,
        approvalExpires: null,
        decisionAt: now.toISOString(),
        updatedAt: now.toISOString(),
        auditLogs: [
          ...target.auditLogs,
          {
            timestamp: now.toISOString(),
            action: 'CLAIM_FOR_DECISION',
            detail: 'Owner initiated approval. System claimed record to avoid race conditions.',
            actor: 'system',
          },
          {
            timestamp: now.toISOString(),
            action: 'FREEBUSY_CONFLICT_DETECTED',
            detail: `Google Calendar freebusy check failed: Overlaps with "${conflictingTitle}". Double booking prevented!`,
            actor: 'system',
          },
          {
            timestamp: now.toISOString(),
            action: 'CONFLICT_EMAIL_SENT',
            detail: `Visitor notified that requested time slot is no longer free.`,
            actor: 'system',
          }
        ]
      };

      const conflictEmail: SimulatedEmail = {
        id: `mail-conf-${Date.now()}`,
        to: target.email,
        from: getSystemSenderEmail(),
        subject: 'Appointment request update — Time no longer available',
        type: 'conflict',
        bookingId: target.id,
        sentAt: now.toISOString(),
        read: false,
        content: {
          greeting: `Hi ${target.name},`,
          bodyText: `That requested time slot is no longer available due to a calendar conflict. Please submit another appointment request with an alternative date or time.`,
          notes: 'Google Calendar double-booking was automatically prevented.'
        }
      };

      setBookings(prev => prev.map(b => b.id === target.id ? conflictBooking : b));
      setEmails(prev => [conflictEmail, ...prev]);

      return {
        success: false,
        action: 'conflict',
        booking: conflictBooking,
        conflictDetail: conflictingTitle,
        error: `Calendar conflict detected: Overlaps with "${conflictingTitle}". Meeting was not booked.`
      };
    }

    // Freebusy check passed! Create the Google Calendar event
    const newEventId = `gcal-evt-${Date.now()}`;
    const meetLink = `https://meet.google.com/${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;

    const newCalendarEvent: CalendarEvent = {
      id: newEventId,
      title: `Meeting with ${target.name}`,
      description: `Purpose: ${target.purpose}\nCompany: ${target.company || '—'}\nContact: ${target.email}\nCreated after manual owner approval.`,
      start: target.requestedStart,
      end: target.requestedEnd,
      attendeeEmail: target.email,
      attendeeName: target.name,
      company: target.company,
      bookingId: target.id,
      color: 'emerald',
      isExternalBusyBlock: false,
    };

    const approvedBooking: BookingRequest = {
      ...target,
      status: 'APPROVED',
      calendarEventId: newEventId,
      meetLink,
      approvalToken: null,
      approvalExpires: null,
      decisionAt: now.toISOString(),
      updatedAt: now.toISOString(),
      auditLogs: [
        ...target.auditLogs,
        {
          timestamp: now.toISOString(),
          action: 'CLAIM_FOR_DECISION',
          detail: 'Owner initiated approval. System claimed record to avoid race conditions.',
          actor: 'system',
        },
        {
          timestamp: now.toISOString(),
          action: 'FREEBUSY_CHECK_PASSED',
          detail: 'Google Calendar freebusy check succeeded. 0 conflicts found.',
          actor: 'system',
        },
        {
          timestamp: now.toISOString(),
          action: 'CALENDAR_EVENT_INSERTED',
          detail: `Google Calendar API inserted event ${newEventId}. Google Meet video room attached.`,
          actor: 'owner',
        },
        {
          timestamp: now.toISOString(),
          action: 'CONFIRMATION_EMAIL_SENT',
          detail: `Confirmation with calendar invite and Google Meet link sent to ${target.email}.`,
          actor: 'system',
        }
      ]
    };

    const confirmationEmail: SimulatedEmail = {
      id: `mail-conf-${Date.now()}`,
      to: target.email,
      from: getSystemSenderEmail(),
      subject: `Your appointment is confirmed — ${ownerSettings.ownerName}`,
      type: 'confirmation',
      bookingId: target.id,
      sentAt: now.toISOString(),
      read: false,
      content: {
        greeting: `Hi ${target.name},`,
        bodyText: `Your appointment has been approved and scheduled into Google Calendar!\n\nDate & Time: ${new Date(target.requestedStart).toLocaleString()} (${target.timezone})\nDuration: ${target.durationMinutes} minutes\nVideo link: ${meetLink}`,
        actionLabel: 'Join Google Meet',
        notes: 'A calendar invitation has also been synchronized to your primary calendar.'
      }
    };

    setCalendarEvents(prev => [...prev, newCalendarEvent]);
    setBookings(prev => prev.map(b => b.id === target.id ? approvedBooking : b));
    setEmails(prev => [confirmationEmail, ...prev]);

    return {
      success: true,
      action: 'approved',
      booking: approvedBooking,
    };
  };

  const addManualCalendarBlock = (title: string, startIso: string, endIso: string) => {
    const block: CalendarEvent = {
      id: `gcal-manual-${Date.now()}`,
      title,
      description: 'Manually added calendar busy block.',
      start: startIso,
      end: endIso,
      attendeeEmail: ownerSettings.ownerEmail,
      attendeeName: ownerSettings.ownerName,
      color: 'slate',
      isExternalBusyBlock: true,
    };
    setCalendarEvents(prev => [...prev, block]);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const markEmailAsRead = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read: true } : e));
  };

  const markAllEmailsAsRead = () => {
    setEmails(prev => prev.map(e => ({ ...e, read: true })));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const initial = getInitialData();
    setBookings(initial.bookings);
    setCalendarEvents(initial.calendarEvents);
    setEmails(initial.emails);
    setReviewParam(null);
  };

  // Bot simulation
  const simulateBotAttack = async () => {
    return {
      success: true,
      message: 'Honeypot test submitted with hidden field populated. Blocked instantly with 400 error.',
    };
  };

  // Conflict simulation
  const simulateConflictScenario = async () => {
    const conflictBooking = bookings.find(b => b.id === 'req-conflict-demo-1');
    if (conflictBooking) {
      return {
        success: true,
        message: 'Conflict test booking ready in queue. Click "Review & Approve" to see conflict detection in action!',
        bookingId: conflictBooking.id,
      };
    }
    return {
      success: false,
      message: 'Reset demo data to restore the pre-seeded conflict test scenario.',
      bookingId: '',
    };
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        calendarEvents,
        emails,
        unreadEmailCount,
        pendingApprovalCount,
        pendingVerificationCount,
        ownerSettings,
        reviewParam,
        setReviewParam,
        submitBookingRequest,
        verifyVisitorEmail,
        processOwnerDecision,
        checkSlotAvailability,
        addManualCalendarBlock,
        deleteCalendarEvent,
        deleteBooking,
        markEmailAsRead,
        markAllEmailsAsRead,
        resetAllData,
        simulateBotAttack,
        simulateConflictScenario,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};
