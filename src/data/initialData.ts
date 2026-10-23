import { BookingRequest, CalendarEvent, SimulatedEmail } from '../types';

export const getOwnerEmail = () => 'anya.g@mintwork.io';
export const getSystemSenderEmail = () => 'notifications@mintwork.io';

export const getInitialData = (): {
  bookings: BookingRequest[];
  calendarEvents: CalendarEvent[];
  emails: SimulatedEmail[];
} => {
  const now = new Date();
  
  // Create relative dates
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(now.getDate() + 2);
  
  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);

  // Helper to format ISO with specific hours
  const createDate = (base: Date, hours: number, minutes = 0) => {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  // 1. Existing Google Calendar busy blocks (already on owner's calendar)
  const calendarEvents: CalendarEvent[] = [
    {
      id: 'gcal-busy-1',
      title: 'Sprint Planning & Architecture Sync',
      description: 'Internal engineering team weekly cadence.',
      start: createDate(tomorrow, 14, 0),
      end: createDate(tomorrow, 15, 0),
      attendeeEmail: 'eng-leads@techcraft.io',
      attendeeName: 'Engineering Core',
      company: 'TechCraft Internal',
      color: 'slate',
      isExternalBusyBlock: true,
    },
    {
      id: 'gcal-busy-2',
      title: 'Product Roadmap Review with Founders',
      description: 'Executive roadmap check-in for Q4 deliverables.',
      start: createDate(dayAfterTomorrow, 10, 30),
      end: createDate(dayAfterTomorrow, 11, 30),
      attendeeEmail: 'founders@techcraft.io',
      attendeeName: 'Executive Team',
      company: 'TechCraft Internal',
      color: 'slate',
      isExternalBusyBlock: true,
    },
    {
      id: 'gcal-event-approved-1',
      title: 'Meeting with Sarah Chen',
      description: 'Purpose: SDK Evaluation & Enterprise SLAs\nCompany: Acme Corp\nContact: sarah.chen@acme.com\nCreated after manual approval.',
      start: createDate(tomorrow, 10, 0),
      end: createDate(tomorrow, 10, 30),
      attendeeEmail: 'sarah.chen@acme.com',
      attendeeName: 'Sarah Chen',
      company: 'Acme Corp',
      bookingId: 'req-approved-1',
      color: 'emerald',
      isExternalBusyBlock: false,
    }
  ];

  // 2. Initial Booking Requests
  const bookings: BookingRequest[] = [
    {
      id: 'req-pending-approval-1',
      name: 'Elena Rostova',
      email: 'elena.rostova@synthworks.ai',
      company: 'SynthWorks AI',
      purpose: 'Discuss enterprise calendar API integration and custom approval webhook requirements for our 80-person engineering team.',
      requestedStart: createDate(dayAfterTomorrow, 14, 0),
      requestedEnd: createDate(dayAfterTomorrow, 14, 30),
      durationMinutes: 30,
      timezone: 'America/New_York',
      status: 'PENDING_APPROVAL',
      emailVerifiedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      verificationToken: null,
      verificationExpires: null,
      approvalToken: 'appr_tok_elena_92k8f',
      approvalExpires: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      decisionAt: null,
      calendarEventId: null,
      meetLink: null,
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      auditLogs: [
        {
          timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
          action: 'REQUEST_SUBMITTED',
          detail: 'Visitor submitted appointment request form.',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
          action: 'VERIFICATION_SENT',
          detail: 'Verification email sent via Resend API to elena.rostova@synthworks.ai.',
          actor: 'system',
        },
        {
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          action: 'EMAIL_VERIFIED',
          detail: 'Visitor completed email verification. Status moved to PENDING_APPROVAL. One-time approval link generated.',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          action: 'OWNER_NOTIFIED',
          detail: 'Approval dispatch email delivered to anya.g@mintwork.io with one-time action links.',
          actor: 'system',
        }
      ]
    },
    {
      id: 'req-pending-verification-1',
      name: 'Marcus Vance',
      email: 'marcus.v@cloudcore.dev',
      company: 'CloudCore Systems',
      purpose: 'Technical deep-dive on self-hosted deployment architecture and zero-trust Google Workspace permissions.',
      requestedStart: createDate(inThreeDays, 11, 0),
      requestedEnd: createDate(inThreeDays, 11, 30),
      durationMinutes: 30,
      timezone: 'Europe/London',
      status: 'PENDING_VERIFICATION',
      emailVerifiedAt: null,
      verificationToken: 'verif_tok_marcus_74x1b',
      verificationExpires: new Date(now.getTime() + 28 * 60 * 1000).toISOString(),
      approvalToken: null,
      approvalExpires: null,
      decisionAt: null,
      calendarEventId: null,
      meetLink: null,
      createdAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      auditLogs: [
        {
          timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          action: 'REQUEST_SUBMITTED',
          detail: 'Visitor submitted appointment request form.',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          action: 'VERIFICATION_SENT',
          detail: 'Verification email dispatched. Waiting for visitor to click token link.',
          actor: 'system',
        }
      ]
    },
    {
      id: 'req-conflict-demo-1',
      name: 'Devon Miller',
      email: 'devon@horizonventures.vc',
      company: 'Horizon Ventures',
      purpose: 'Follow-up discussion regarding partnership terms and product syndication opportunities.',
      // Intentionally overlaps with Sprint Planning busy block (tomorrow 14:00 - 15:00)
      requestedStart: createDate(tomorrow, 14, 0),
      requestedEnd: createDate(tomorrow, 14, 30),
      durationMinutes: 30,
      timezone: 'America/Los_Angeles',
      status: 'PENDING_APPROVAL',
      emailVerifiedAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      verificationToken: null,
      verificationExpires: null,
      approvalToken: 'appr_tok_devon_conflict_test',
      approvalExpires: new Date(now.getTime() + 68 * 60 * 60 * 1000).toISOString(),
      decisionAt: null,
      calendarEventId: null,
      meetLink: null,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      auditLogs: [
        {
          timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          action: 'REQUEST_SUBMITTED',
          detail: 'Visitor requested slot at tomorrow 14:00 (overlapping with existing internal busy block).',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
          action: 'EMAIL_VERIFIED',
          detail: 'Visitor verified email. Ready for owner conflict check testing.',
          actor: 'visitor',
        }
      ]
    },
    {
      id: 'req-approved-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@acme.com',
      company: 'Acme Corp',
      purpose: 'SDK Evaluation & Enterprise SLAs',
      requestedStart: createDate(tomorrow, 10, 0),
      requestedEnd: createDate(tomorrow, 10, 30),
      durationMinutes: 30,
      timezone: 'Asia/Singapore',
      status: 'APPROVED',
      emailVerifiedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      verificationToken: null,
      verificationExpires: null,
      approvalToken: null,
      approvalExpires: null,
      decisionAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      calendarEventId: 'gcal-event-approved-1',
      meetLink: 'https://meet.google.com/qwe-rtyu-iop',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      auditLogs: [
        {
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          action: 'REQUEST_SUBMITTED',
          detail: 'Visitor submitted appointment request form.',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          action: 'EMAIL_VERIFIED',
          detail: 'Visitor email verified successfully.',
          actor: 'visitor',
        },
        {
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          action: 'REQUEST_CLAIMED',
          detail: 'Owner initiated decision. Status set to PROCESSING to prevent duplicate clicks.',
          actor: 'system',
        },
        {
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          action: 'FREEBUSY_CHECK_PASSED',
          detail: 'Google Calendar query returned 0 busy conflicts for primary calendar.',
          actor: 'system',
        },
        {
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          action: 'CALENDAR_EVENT_CREATED',
          detail: 'Event successfully created in Google Calendar (ID: gcal-event-approved-1). Attendees notified.',
          actor: 'owner',
        }
      ]
    }
  ];

  // 3. Initial Outgoing Emails in the simulated inbox
  const emails: SimulatedEmail[] = [
    {
      id: 'mail-verif-marcus',
      to: 'marcus.v@cloudcore.dev',
      from: getSystemSenderEmail(),
      subject: 'Verify your appointment request',
      type: 'verification',
      bookingId: 'req-pending-verification-1',
      sentAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      token: 'verif_tok_marcus_74x1b',
      actionUrl: '/api/verify-email?token=verif_tok_marcus_74x1b',
      read: false,
      content: {
        greeting: 'Hi Marcus Vance,',
        bodyText: 'Please verify your email address to submit your appointment request with Anya G.',
        actionLabel: 'Verify email & submit request',
        notes: 'This link expires in 30 minutes. Verifying submits a request only; it does not automatically book a meeting on the calendar.'
      }
    },
    {
      id: 'mail-owner-elena',
      to: getOwnerEmail(),
      from: getSystemSenderEmail(),
      subject: 'New appointment request: Elena Rostova (Verified)',
      type: 'owner_review',
      bookingId: 'req-pending-approval-1',
      sentAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      token: 'appr_tok_elena_92k8f',
      approveUrl: '/approve?token=appr_tok_elena_92k8f&action=approve',
      rejectUrl: '/approve?token=appr_tok_elena_92k8f&action=reject',
      read: false,
      content: {
        greeting: 'New verified appointment request',
        bodyText: 'Elena Rostova from SynthWorks AI has requested a 30-minute discussion regarding API integration.',
        actionLabel: 'Review & Approve',
        secondaryActionLabel: 'Reject Request',
        notes: 'This link expires in 72 hours and can only be used once. Opening this link performs a review check only; calendar events are only created when you confirm approval.'
      }
    },
    {
      id: 'mail-owner-devon',
      to: getOwnerEmail(),
      from: getSystemSenderEmail(),
      subject: 'New appointment request: Devon Miller (Verified)',
      type: 'owner_review',
      bookingId: 'req-conflict-demo-1',
      sentAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      token: 'appr_tok_devon_conflict_test',
      approveUrl: '/approve?token=appr_tok_devon_conflict_test&action=approve',
      rejectUrl: '/approve?token=appr_tok_devon_conflict_test&action=reject',
      read: true,
      content: {
        greeting: 'New verified appointment request',
        bodyText: 'Devon Miller from Horizon Ventures has requested a 30-minute partnership follow-up.',
        actionLabel: 'Review & Approve',
        secondaryActionLabel: 'Reject Request',
        notes: 'Note: This requested time slot conflicts with your Sprint Planning event. You can test the conflict detection engine by reviewing this request.'
      }
    },
    {
      id: 'mail-confirm-sarah',
      to: 'sarah.chen@acme.com',
      from: getSystemSenderEmail(),
      subject: 'Your appointment is confirmed — MINTWORK',
      type: 'confirmation',
      bookingId: 'req-approved-1',
      sentAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      read: true,
      content: {
        greeting: 'Hi Sarah Chen,',
        bodyText: 'Your appointment has been approved and scheduled on Google Calendar. A Google Calendar invitation with Google Meet video link has been dispatched to your email.',
        actionLabel: 'Join Google Meet',
        notes: 'Confirmed for: Tomorrow at 10:00 AM (30 minutes). Topic: SDK Evaluation & Enterprise SLAs.'
      }
    }
  ];

  return { bookings, calendarEvents, emails };
};
