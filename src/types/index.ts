/**
 * Homestay Operations Management System Types
 */

// User & Role Types
export type UserRole = 'OWNER' | 'CLEANER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
}

// Property & Unit Types
export interface Property {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  defaultCheckInTime: string; // e.g. "15:00"
  defaultCheckOutTime: string; // e.g. "12:00"
}

// Distinct Unit Statuses
export type UnitStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'OCCUPIED'
  | 'AWAITING_CLEANING'
  | 'CLEANING'
  | 'READY'
  | 'MAINTENANCE'
  | 'BLOCKED';

export interface Unit {
  id: string;
  propertyId: string;
  name: string; // e.g. "Unit A"
  code: string; // e.g. "A01"
  description: string;
  capacity: number;
  defaultCheckIn: string; // "15:00"
  defaultCheckOut: string; // "12:00"
  status: UnitStatus;
  isActive: boolean;
  currentBookingId?: string;
  notes?: string;
}

// Distinct Booking Statuses
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// Payment Statuses
export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: string;
  unitId: string;
  guestName: string;
  guestPhone: string;
  guestId?: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM (e.g. "15:00")
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // HH:MM (e.g. "12:00")
  guestCount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  remark: string; // Visible directly on calendar
  earlyCheckInApproved?: boolean;
  approvedEarlyCheckInTime?: string;
  guestCheckedOutAt?: string; // Timestamp
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
  lastStayDate?: string;
  remarks?: string;
}

// Cleaner Types
export interface Cleaner {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  isDefault: boolean;
  assignedUnitIds?: string[];
}

// Cleaning Checklist Template Item
export interface ChecklistItemTemplate {
  id: string;
  category: 'BEDROOM' | 'BATHROOM' | 'GENERAL' | 'KITCHEN' | 'REFRESHMENTS';
  title: string;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Active Checklist Item in Task
export interface TaskChecklistItem {
  id: string;
  templateId: string;
  category: 'BEDROOM' | 'BATHROOM' | 'GENERAL' | 'KITCHEN' | 'REFRESHMENTS';
  title: string;
  isRequired: boolean;
  isCompleted: boolean;
}

// Cleaning Task
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ISSUE_REPORTED';

export interface CleaningTask {
  id: string;
  unitId: string;
  unitName: string;
  bookingId?: string;
  guestName?: string;
  guestCheckoutTime?: string;
  cleanerId: string;
  cleanerName: string;
  cleanerPhone: string;
  status: TaskStatus;
  checklist: TaskChecklistItem[];
  notes?: string;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
}

// Maintenance & Issue Reporting
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueCategory =
  | 'Air conditioner'
  | 'Water heater'
  | 'Light'
  | 'Fan'
  | 'Remote'
  | 'Furniture'
  | 'Kitchen equipment'
  | 'Plate / glass'
  | 'Bathroom'
  | 'Plumbing'
  | 'Other';

export interface MaintenanceIssue {
  id: string;
  unitId: string;
  unitName: string;
  taskId?: string;
  reporterName: string;
  reporterRole: UserRole;
  category: IssueCategory;
  description: string;
  priority: IssuePriority;
  photoUrl?: string; // Base64 or mock image URL
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// Inventory Items
export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  unit: string; // e.g. "rolls", "bottles", "packs", "boxes"
  isActive: boolean;
  category: string;
}

// Audit Log Entry
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

// App Settings & WhatsApp Templates
export interface SystemSettings {
  propertyName: string;
  propertyAddress: string;
  propertyContact: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  whatsappCleanerTemplate: string;
  whatsappGuestCheckInTemplate: string;
}
