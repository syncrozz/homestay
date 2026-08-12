import {
  Property,
  Unit,
  Booking,
  Guest,
  Cleaner,
  ChecklistItemTemplate,
  CleaningTask,
  MaintenanceIssue,
  InventoryItem,
  SystemSettings,
  AuditLog
} from '../types';

export const initialProperty: Property = {
  id: 'prop-1',
  name: 'Your Homestay',
  address: 'Jalan Beachfront Villa 1, 80000 Penang, Malaysia',
  contactNumber: '+60123456789',
  defaultCheckInTime: '15:00',
  defaultCheckOutTime: '12:00',
};

export const initialSettings: SystemSettings = {
  propertyName: 'Your Homestay',
  propertyAddress: 'Jalan Beachfront Villa 1, Penang',
  propertyContact: '+60123456789',
  defaultCheckInTime: '15:00',
  defaultCheckOutTime: '12:00',
  whatsappCleanerTemplate: `🧹 CLEANING TASK

Property: {property_name}
Unit: {unit_name}
Guest: {guest_name}
Checkout Time: {checkout_time}

Please complete the mandatory checklist before marking the unit as READY.

Thank you!`,
  whatsappGuestCheckInTemplate: `Hi {guest_name},

Thank you for choosing {property_name}!

Your reservation for {unit_name} is confirmed.
Check-in time: {check_in_time} on {check_in_date}.
Check-out time: {check_out_time} on {check_out_date}.

If you need anything prior to arrival, feel free to reply to this message. See you soon!`,
};

export const initialUnits: Unit[] = [
  {
    id: 'unit-a',
    propertyId: 'prop-1',
    name: 'Unit A',
    code: 'A01',
    description: 'Deluxe Sea View Suite with balcony and king bed',
    capacity: 4,
    defaultCheckIn: '15:00',
    defaultCheckOut: '12:00',
    status: 'AWAITING_CLEANING',
    isActive: true,
    notes: 'Ground floor, easy accessibility',
  },
  {
    id: 'unit-b',
    propertyId: 'prop-1',
    name: 'Unit B',
    code: 'B02',
    description: 'Family Loft Apartment with 2 queen beds',
    capacity: 6,
    defaultCheckIn: '15:00',
    defaultCheckOut: '12:00',
    status: 'READY',
    isActive: true,
    notes: 'Second floor, sea view',
  },
  {
    id: 'unit-c',
    propertyId: 'prop-1',
    name: 'Unit C',
    code: 'C03',
    description: 'Cozy Studio Suite with garden terrace',
    capacity: 2,
    defaultCheckIn: '15:00',
    defaultCheckOut: '12:00',
    status: 'OCCUPIED',
    isActive: true,
    notes: 'Garden view, near pool',
  },
];

export const initialCleaners: Cleaner[] = [
  {
    id: 'cleaner-1',
    name: 'Ali Bin Ahmad',
    phone: '+60189876543',
    isActive: true,
    isDefault: true,
    assignedUnitIds: ['unit-a', 'unit-b'],
  },
  {
    id: 'cleaner-2',
    name: 'Siti Nurhaliza',
    phone: '+60176543210',
    isActive: true,
    isDefault: false,
    assignedUnitIds: ['unit-c'],
  },
];

export const initialChecklistTemplates: ChecklistItemTemplate[] = [
  // Bedroom
  { id: 'ck-1', category: 'BEDROOM', title: 'Change bed sheets and pillowcases', isRequired: true, isActive: true, sortOrder: 1 },
  { id: 'ck-2', category: 'BEDROOM', title: 'Check pillow covers and extra blankets', isRequired: true, isActive: true, sortOrder: 2 },
  { id: 'ck-3', category: 'BEDROOM', title: 'Ensure bed is neatly arranged and dusted', isRequired: true, isActive: true, sortOrder: 3 },
  // Bathroom
  { id: 'ck-4', category: 'BATHROOM', title: 'Replace toilet tissue roll with fresh roll', isRequired: true, isActive: true, sortOrder: 4 },
  { id: 'ck-5', category: 'BATHROOM', title: 'Check shampoo & shower gel dispensers, refill if low', isRequired: true, isActive: true, sortOrder: 5 },
  { id: 'ck-6', category: 'BATHROOM', title: 'Scrub bathroom floor, sink and toilet bowl clean', isRequired: true, isActive: true, sortOrder: 6 },
  // General
  { id: 'ck-7', category: 'GENERAL', title: 'Vacuum and mop all floor surfaces', isRequired: true, isActive: true, sortOrder: 7 },
  { id: 'ck-8', category: 'GENERAL', title: 'Check and clear all rubbish bins, replace liners', isRequired: true, isActive: true, sortOrder: 8 },
  { id: 'ck-9', category: 'GENERAL', title: 'Check overall room cleanliness & air freshener', isRequired: true, isActive: true, sortOrder: 9 },
  // Kitchen
  { id: 'ck-10', category: 'KITCHEN', title: 'Ensure plates, mugs, and cutlery are spotless', isRequired: true, isActive: true, sortOrder: 10 },
  { id: 'ck-11', category: 'KITCHEN', title: 'Check kettle and microwave cleanliness', isRequired: true, isActive: true, sortOrder: 11 },
  { id: 'ck-12', category: 'KITCHEN', title: 'Wipe kitchen counter and sink clean', isRequired: true, isActive: true, sortOrder: 12 },
  // Refreshments
  { id: 'ck-13', category: 'REFRESHMENTS', title: 'Replenish 2x mineral water bottles', isRequired: false, isActive: true, sortOrder: 13 },
  { id: 'ck-14', category: 'REFRESHMENTS', title: 'Replenish instant coffee & Maggi noodles', isRequired: false, isActive: true, sortOrder: 14 },
];

// Helper to get formatted relative date YYYY-MM-DD
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialBookings: Booking[] = [
  {
    id: 'bk-101',
    unitId: 'unit-a',
    guestName: 'Ahmad Razak',
    guestPhone: '+60129998877',
    checkInDate: getRelativeDateStr(-2),
    checkInTime: '15:00',
    checkOutDate: getRelativeDateStr(0), // Checkout TODAY
    checkOutTime: '12:00',
    guestCount: 3,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 380,
    depositAmount: 100,
    balanceAmount: 0,
    remark: 'Family with 1 child. Requested extra towels.',
    guestCheckedOutAt: `${getRelativeDateStr(0)}T11:45:00`,
    createdAt: `${getRelativeDateStr(-3)}T10:00:00`,
  },
  {
    id: 'bk-102',
    unitId: 'unit-a',
    guestName: 'Siti Sarah',
    guestPhone: '+60134445566',
    checkInDate: getRelativeDateStr(0), // Checkin TODAY afternoon
    checkInTime: '15:00',
    checkOutDate: getRelativeDateStr(2),
    checkOutTime: '12:00',
    guestCount: 4,
    status: 'CONFIRMED',
    paymentStatus: 'DEPOSIT_PAID',
    totalAmount: 420,
    depositAmount: 150,
    balanceAmount: 270,
    remark: 'Anniversary trip + baby cot needed.',
    earlyCheckInApproved: false,
    createdAt: `${getRelativeDateStr(-2)}T14:30:00`,
  },
  {
    id: 'bk-103',
    unitId: 'unit-b',
    guestName: 'David Tan',
    guestPhone: '+60161112233',
    checkInDate: getRelativeDateStr(1),
    checkInTime: '15:00',
    checkOutDate: getRelativeDateStr(3),
    checkOutTime: '12:00',
    guestCount: 5,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 550,
    depositAmount: 200,
    balanceAmount: 0,
    remark: 'Late arrival (~7:00 PM). Self check-in code.',
    createdAt: `${getRelativeDateStr(-1)}T11:15:00`,
  },
  {
    id: 'bk-104',
    unitId: 'unit-c',
    guestName: 'Nadia Ibrahim',
    guestPhone: '+60198887766',
    checkInDate: getRelativeDateStr(-1),
    checkInTime: '15:00',
    checkOutDate: getRelativeDateStr(1),
    checkOutTime: '12:00',
    guestCount: 2,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 300,
    depositAmount: 100,
    balanceAmount: 0,
    remark: 'Honeymoon couple. Welcome drink setup.',
    createdAt: `${getRelativeDateStr(-2)}T09:00:00`,
  },
];

export const initialGuests: Guest[] = [
  {
    id: 'gst-1',
    name: 'Ahmad Razak',
    phone: '+60129998877',
    totalBookings: 2,
    lastStayDate: getRelativeDateStr(0),
    remarks: 'Prefers quiet unit, always leaves room neat.',
  },
  {
    id: 'gst-2',
    name: 'Siti Sarah',
    phone: '+60134445566',
    totalBookings: 1,
    lastStayDate: getRelativeDateStr(0),
    remarks: 'Requested early check-in if available.',
  },
  {
    id: 'gst-3',
    name: 'David Tan',
    phone: '+60161112233',
    totalBookings: 3,
    lastStayDate: getRelativeDateStr(1),
    remarks: 'Repeat guest. Always pays via online transfer.',
  },
  {
    id: 'gst-4',
    name: 'Nadia Ibrahim',
    phone: '+60198887766',
    totalBookings: 1,
    lastStayDate: getRelativeDateStr(-1),
    remarks: 'Requested high floor terrace view.',
  },
];

export const initialCleaningTasks: CleaningTask[] = [
  {
    id: 'task-1',
    unitId: 'unit-a',
    unitName: 'Unit A',
    bookingId: 'bk-101',
    guestName: 'Ahmad Razak',
    guestCheckoutTime: '12:00 PM',
    cleanerId: 'cleaner-1',
    cleanerName: 'Ali Bin Ahmad',
    cleanerPhone: '+60189876543',
    status: 'PENDING',
    checklist: initialChecklistTemplates.map((item) => ({
      id: `task-ck-${item.id}`,
      templateId: item.id,
      category: item.category,
      title: item.title,
      isRequired: item.isRequired,
      isCompleted: false,
    })),
    createdAt: `${getRelativeDateStr(0)}T11:45:00`,
    assignedAt: `${getRelativeDateStr(0)}T11:45:00`,
  },
];

export const initialMaintenanceIssues: MaintenanceIssue[] = [
  {
    id: 'maint-1',
    unitId: 'unit-b',
    unitName: 'Unit B',
    reporterName: 'Ali Bin Ahmad',
    reporterRole: 'CLEANER',
    category: 'Air conditioner',
    description: 'Aircond remote battery leaking and main AC unit making a rattling noise in living area.',
    priority: 'MEDIUM',
    status: 'OPEN',
    reportedAt: `${getRelativeDateStr(-1)}T14:20:00`,
  },
];

export const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Toilet Tissue Rolls', currentStock: 8, minimumStock: 15, unit: 'rolls', isActive: true, category: 'Bathroom' },
  { id: 'inv-2', name: 'Shampoo Bottle (500ml)', currentStock: 12, minimumStock: 5, unit: 'bottles', isActive: true, category: 'Bathroom' },
  { id: 'inv-3', name: 'Shower Gel (500ml)', currentStock: 10, minimumStock: 5, unit: 'bottles', isActive: true, category: 'Bathroom' },
  { id: 'inv-4', name: 'Mineral Water (500ml)', currentStock: 48, minimumStock: 24, unit: 'bottles', isActive: true, category: 'Refreshments' },
  { id: 'inv-5', name: 'Maggi Instant Noodles', currentStock: 14, minimumStock: 20, unit: 'packs', isActive: true, category: 'Refreshments' },
  { id: 'inv-6', name: 'Trash Bags (Heavy Duty)', currentStock: 35, minimumStock: 10, unit: 'packs', isActive: true, category: 'Cleaning' },
  { id: 'inv-7', name: 'Microfiber Cleaning Cloths', currentStock: 18, minimumStock: 10, unit: 'pcs', isActive: true, category: 'Cleaning' },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: `${getRelativeDateStr(0)}T11:45:00`,
    userId: 'usr-owner',
    userName: 'Homestay Owner',
    userRole: 'OWNER',
    action: 'GUEST_CHECKOUT',
    details: 'Marked guest Ahmad Razak as checked out for Unit A. Unit status changed to Awaiting Cleaning.',
  },
  {
    id: 'log-2',
    timestamp: `${getRelativeDateStr(0)}T11:46:00`,
    userId: 'usr-owner',
    userName: 'Homestay Owner',
    userRole: 'OWNER',
    action: 'CLEANING_ASSIGNED',
    details: 'Assigned cleaning task for Unit A to cleaner Ali Bin Ahmad.',
  },
];
