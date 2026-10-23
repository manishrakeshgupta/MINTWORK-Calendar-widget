export type BookingStatus = 
  | 'PENDING_VERIFICATION' 
  | 'PENDING_APPROVAL' 
  | 'PROCESSING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CONFLICT';

export interface BookingAuditLog {
  timestamp: string;
  action: string;
  detail: string;
  actor: 'visitor' | 'owner' | 'system';
}

export interface BookingRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  purpose: string;
  requestedStart: string; // ISO string
  requestedEnd: string;   // ISO string
  durationMinutes: number;
  timezone: string;
  status: BookingStatus;
  emailVerifiedAt: string | null;
  verificationToken: string | null;
  verificationExpires: string | null;
  approvalToken: string | null;
  approvalExpires: string | null;
  decisionAt: string | null;
  calendarEventId: string | null;
  meetLink?: string | null;
  createdAt: string;
  updatedAt: string;
  honeypotTriggered?: boolean;
  auditLogs: BookingAuditLog[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string; // ISO
  end: string;   // ISO
  attendeeEmail: string;
  attendeeName?: string;
  company?: string;
  bookingId?: string;
  color: 'emerald' | 'blue' | 'slate' | 'amber';
  isExternalBusyBlock?: boolean;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  type: 'verification' | 'owner_review' | 'confirmation' | 'rejection' | 'conflict';
  bookingId: string;
  sentAt: string;
  token?: string;
  actionUrl?: string;
  approveUrl?: string;
  rejectUrl?: string;
  read: boolean;
  content: {
    greeting: string;
    bodyText: string;
    actionLabel?: string;
    secondaryActionLabel?: string;
    notes?: string;
  };
}

export type ActiveTab = 'booking' | 'inbox' | 'admin' | 'calendar' | 'embed' | 'workbench';
